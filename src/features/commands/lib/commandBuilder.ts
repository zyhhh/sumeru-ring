export type CommandKind = 'maven' | 'docker' | 'git' | 'curl'
export type CommandField = 'target' | 'secondary' | 'content' | 'options'

export interface CommandForm {
  kind: CommandKind
  option: string
  target: string
  secondary?: string
  content?: string
  extras?: string[]
  count?: number
}

function quote(value: string): string {
  return /[\s"'\\$`]/.test(value) ? `'${value.split("'").join(`'\\''`)}'` : value
}

function quoteText(value: string): string {
  return `'${value.split("'").join(`'\\''`)}'`
}

const REQUIRED_TARGET: Record<string, string> = {
  'docker:run': '请输入要运行的镜像名称', 'docker:build': '请输入包含 Dockerfile 的文件夹路径', 'docker:start': '请输入容器名称或容器编号',
  'docker:stop': '请输入容器名称或容器编号', 'docker:restart': '请输入容器名称或容器编号', 'docker:logs': '请输入容器名称或容器编号',
  'docker:exec': '请输入容器名称或容器编号', 'docker:remove-container': '请输入要删除的容器名称或容器编号', 'docker:remove-image': '请输入要删除的镜像名称或镜像编号',
  'docker:pull': '请输入要下载的镜像名称', 'docker:push': '请输入要上传的镜像名称',
  'git:switch': '请输入要切换到的分支名称', 'git:create-branch': '请输入新分支名称', 'git:delete-branch': '请输入要删除的分支名称',
  'git:add': '请输入要暂存的文件路径', 'git:commit': '请输入提交说明', 'git:restore': '请输入要恢复的文件路径',
  'git:reset': '请输入要回退到的提交编号', 'git:revert': '请输入要撤销的提交编号', 'git:tag': '请输入标签名称',
  'curl:get': '请输入请求网址', 'curl:post': '请输入请求网址', 'curl:put': '请输入请求网址', 'curl:patch': '请输入请求网址', 'curl:delete': '请输入请求网址',
}

const OPTION_CONFLICTS: { kind: CommandKind; action: string; left: string; right: string; message: string }[] = [
  { kind: 'maven', action: '*', left: 'offline', right: 'update', message: '“离线执行”和“强制检查依赖更新”互相冲突：离线模式禁止联网，检查更新不会生效' },
  { kind: 'git', action: 'reset', left: 'hard', right: 'mixed', message: '“同时丢弃文件改动”和“保留文件但取消暂存”是两种不同的回退方式，不能同时选择' },
]

export function getOptionConflict(form: CommandForm): string {
  const selected = new Set(form.extras ?? [])
  return OPTION_CONFLICTS.find(rule => rule.kind === form.kind && (rule.action === '*' || rule.action === form.option) && selected.has(rule.left) && selected.has(rule.right))?.message ?? ''
}

export function getConflictingOption(form: CommandForm, option: string): string {
  const selected = new Set(form.extras ?? [])
  const rule = OPTION_CONFLICTS.find(item => item.kind === form.kind && (item.action === '*' || item.action === form.option) && ((item.left === option && selected.has(item.right)) || (item.right === option && selected.has(item.left))))
  return rule?.message ?? ''
}

export function validateCommand(form: CommandForm): Partial<Record<CommandField, string>> {
  const errors: Partial<Record<CommandField, string>> = {}
  const targetMessage = REQUIRED_TARGET[`${form.kind}:${form.option}`]
  if (targetMessage && !form.target.trim()) errors.target = targetMessage
  if (form.kind === 'git' && form.option === 'commit' && form.extras?.includes('push') && !form.secondary?.trim()) errors.secondary = '请输入要推送到的远端名称和分支，例如 origin main'
  if (form.kind === 'git' && ['pull', 'push'].includes(form.option) && form.secondary?.trim() && !form.target.trim()) errors.target = '填写分支名称时，也要填写远端名称，例如 origin'
  if (form.kind === 'git' && form.option === 'push' && form.extras?.includes('set-upstream')) {
    if (!form.target.trim()) errors.target = '设置默认远端分支时，请输入远端名称，例如 origin'
    if (!form.secondary?.trim()) errors.secondary = '设置默认远端分支时，请输入分支名称，例如 main'
  }
  if (form.kind === 'curl' && ['post', 'put', 'patch'].includes(form.option) && !form.content?.trim()) errors.content = '请输入要发送的数据内容'
  if (form.kind === 'maven' && form.extras?.includes('also-make') && !form.target.trim()) errors.target = '同时构建依赖模块前，请先输入要构建的模块名称'
  const conflict = getOptionConflict(form)
  if (conflict) errors.options = conflict
  return errors
}

function assertValid(form: CommandForm) {
  const message = Object.values(validateCommand(form))[0]
  if (message) throw new Error(message)
}

export function buildCommand(form: CommandForm): string {
  assertValid(form)
  const target = form.target.trim()
  const secondary = form.secondary?.trim() ?? ''
  const extras = new Set(form.extras ?? [])

  if (form.kind === 'maven') {
    const goal = { compile: 'compile', package: 'package', install: 'install', test: 'test', verify: 'verify', dependencies: 'dependency:tree', clean: 'clean' }[form.option] ?? 'package'
    return ['mvn', extras.has('clean') && form.option !== 'clean' && 'clean', goal, target && `-pl ${quote(target)}`, target && extras.has('also-make') && '-am', extras.has('skip-tests') && !['test', 'dependencies'].includes(form.option) && '-DskipTests', extras.has('offline') && '-o', extras.has('update') && '-U'].filter(Boolean).join(' ')
  }

  if (form.kind === 'docker') {
    if (form.option === 'list') return `docker ps${extras.has('all') ? ' -a' : ''}`
    if (form.option === 'build') return ['docker build', extras.has('no-cache') && '--no-cache', secondary && `-t ${quote(secondary)}`, quote(target)].filter(Boolean).join(' ')
    if (form.option === 'run') return ['docker run', extras.has('detached') && '-d', extras.has('auto-remove') && '--rm', secondary && `--name ${quote(secondary)}`, quote(target)].filter(Boolean).join(' ')
    if (form.option === 'logs') return ['docker logs', extras.has('follow') && '-f', `--tail ${form.count || 100}`, quote(target)].filter(Boolean).join(' ')
    if (form.option === 'exec') return ['docker exec', extras.has('interactive') && '-it', quote(target), quote(secondary || '/bin/sh')].filter(Boolean).join(' ')
    if (form.option === 'remove-container') return ['docker rm', extras.has('force') && '-f', extras.has('volumes') && '-v', quote(target)].filter(Boolean).join(' ')
    if (form.option === 'remove-image') return ['docker rmi', extras.has('force') && '-f', quote(target)].filter(Boolean).join(' ')
    return `docker ${{ start: 'start', stop: 'stop', restart: 'restart', pull: 'pull', push: 'push' }[form.option] ?? 'start'} ${quote(target)}`
  }

  if (form.kind === 'git') {
    if (form.option === 'status') return 'git status'
    if (form.option === 'switch') return `git switch ${quote(target)}`
    if (form.option === 'create-branch') return `git switch -c ${quote(target)}`
    if (form.option === 'pull') return ['git pull', target && quote(target), secondary && quote(secondary), extras.has('rebase') && '--rebase'].filter(Boolean).join(' ')
    if (form.option === 'push') return ['git push', target && quote(target), secondary && quote(secondary), extras.has('set-upstream') && '-u'].filter(Boolean).join(' ')
    if (form.option === 'log') return `git log --oneline -${form.count || 10}${extras.has('graph') ? ' --graph --all' : ''}`
    if (form.option === 'add') return `git add ${quote(target)}`
    if (form.option === 'commit') return [`git add ${extras.has('all-files') ? '-A' : '.'}`, `git commit -m ${quoteText(target)}`, extras.has('push') && `git push ${secondary.split(/\s+/).map(quote).join(' ')}`].filter(Boolean).join(' && ')
    if (form.option === 'restore') return `git restore ${extras.has('staged') ? '--staged ' : ''}${quote(target)}`
    if (form.option === 'delete-branch') return `git branch ${extras.has('force') ? '-D' : '-d'} ${quote(target)}`
    if (form.option === 'reset') return `git reset --${extras.has('hard') ? 'hard' : extras.has('mixed') ? 'mixed' : 'soft'} ${quote(target)}`
    if (form.option === 'revert') return `git revert ${extras.has('no-edit') ? '--no-edit ' : ''}${quote(target)}`
    if (form.option === 'tag') return `git tag${secondary ? ` -m ${quoteText(secondary)}` : ''} ${quote(target)}`
  }

  const method = { get: 'GET', post: 'POST', put: 'PUT', patch: 'PATCH', delete: 'DELETE' }[form.option] ?? 'GET'
  return ['curl', `-X ${method}`, extras.has('follow') && '-L', extras.has('verbose') && '-v', secondary && `-H ${quote(`Content-Type: ${secondary}`)}`, form.content?.trim() && `-d ${quote(form.content.trim())}`, quote(target)].filter(Boolean).join(' ')
}

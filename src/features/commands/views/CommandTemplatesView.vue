<script setup lang="ts">
import { computed, reactive } from 'vue'
import { AlertTriangle, Check, Copy, HelpCircle, TerminalSquare } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { buildCommand, getConflictingOption, validateCommand, type CommandForm, type CommandKind } from '../lib/commandBuilder'

type Action = { value: string; label: string; description: string; danger?: boolean }
type Modifier = { value: string; label: string; description: string; actions: string[] }
const kinds: { value: CommandKind; label: string; description: string }[] = [
  { value: 'maven', label: '项目构建', description: '编译、测试、打包和依赖处理' }, { value: 'docker', label: '容器与镜像', description: '运行、维护和清理容器资源' },
  { value: 'git', label: '代码版本', description: '提交、同步、分支和版本回退' }, { value: 'curl', label: '接口请求', description: '获取、写入、更新或删除数据' },
]
const actions: Record<CommandKind, Action[]> = {
  maven: [
    { value: 'compile', label: '编译代码', description: '只编译项目源代码' }, { value: 'test', label: '运行测试', description: '执行项目中的自动测试' },
    { value: 'package', label: '生成安装包', description: '生成 JAR 或 WAR 文件' }, { value: 'install', label: '安装到本机仓库', description: '供本机其他项目依赖' },
    { value: 'verify', label: '完整检查项目', description: '测试并执行质量检查' }, { value: 'dependencies', label: '查看依赖关系', description: '显示项目依赖树' },
    { value: 'clean', label: '清理构建产物', description: '删除 target 文件夹' },
  ],
  docker: [
    { value: 'list', label: '查看容器', description: '列出正在运行的容器' }, { value: 'run', label: '运行镜像', description: '创建并启动新容器' },
    { value: 'build', label: '制作镜像', description: '使用 Dockerfile 构建镜像' }, { value: 'start', label: '启动容器', description: '启动已停止的容器' },
    { value: 'stop', label: '停止容器', description: '让运行中的容器停止' }, { value: 'restart', label: '重启容器', description: '停止后重新启动容器' },
    { value: 'logs', label: '查看日志', description: '读取容器输出日志' }, { value: 'exec', label: '进入容器', description: '在容器中打开命令行' },
    { value: 'pull', label: '下载镜像', description: '从镜像仓库下载' }, { value: 'push', label: '上传镜像', description: '上传到镜像仓库' },
    { value: 'remove-container', label: '删除容器', description: '移除不再使用的容器', danger: true }, { value: 'remove-image', label: '删除镜像', description: '移除本机镜像', danger: true },
  ],
  git: [
    { value: 'status', label: '查看改动', description: '查看当前文件状态' }, { value: 'add', label: '暂存文件', description: '把改动加入待提交区' },
    { value: 'commit', label: '提交代码', description: '暂存、提交并可继续推送' }, { value: 'pull', label: '拉取代码', description: '获取远端最新改动' },
    { value: 'push', label: '推送代码', description: '把本地提交发送到远端' }, { value: 'log', label: '查看提交记录', description: '查看简洁版本历史' },
    { value: 'switch', label: '切换分支', description: '进入已有分支' }, { value: 'create-branch', label: '新建并切换分支', description: '从当前位置创建分支' },
    { value: 'delete-branch', label: '删除本地分支', description: '移除不再需要的分支', danger: true }, { value: 'restore', label: '撤销文件改动', description: '恢复工作区或暂存区文件', danger: true },
    { value: 'reset', label: '回退未推送提交', description: '移动本地分支到旧提交', danger: true }, { value: 'revert', label: '撤销已推送提交', description: '新增一个反向提交，适合远端', danger: true },
    { value: 'tag', label: '创建版本标签', description: '标记一个发布版本' },
  ],
  curl: [
    { value: 'get', label: '获取数据', description: '读取接口内容' }, { value: 'post', label: '新增数据', description: '向接口提交新数据' },
    { value: 'put', label: '完整更新数据', description: '替换一条完整数据' }, { value: 'patch', label: '局部更新数据', description: '只修改部分字段' },
    { value: 'delete', label: '删除数据', description: '请求接口删除数据', danger: true },
  ],
}
const modifiers: Record<CommandKind, Modifier[]> = {
  maven: [
    { value: 'clean', label: '先清理旧产物', description: '构建前删除上次生成内容', actions: ['compile','test','package','install','verify'] },
    { value: 'also-make', label: '同时构建依赖模块', description: '选择模块时连同它依赖的项目一起构建', actions: ['compile','test','package','install','verify'] },
    { value: 'skip-tests', label: '跳过测试', description: '加快构建，但可能遗漏问题', actions: ['compile','package','install','verify'] },
    { value: 'offline', label: '离线执行', description: '只使用本机已有依赖', actions: ['compile','test','package','install','verify','dependencies'] },
    { value: 'update', label: '强制检查依赖更新', description: '重新检查快照和发布版本', actions: ['compile','test','package','install','verify','dependencies'] },
  ],
  docker: [
    { value: 'all', label: '包含已停止容器', description: '同时列出没有运行的容器', actions: ['list'] }, { value: 'detached', label: '在后台运行', description: '启动后不占用当前终端', actions: ['run'] },
    { value: 'auto-remove', label: '停止后自动删除', description: '适合一次性临时容器', actions: ['run'] }, { value: 'no-cache', label: '不使用构建缓存', description: '从头重新制作镜像', actions: ['build'] },
    { value: 'follow', label: '持续显示新日志', description: '保持等待后续日志', actions: ['logs'] }, { value: 'interactive', label: '允许交互输入', description: '进入后可以输入命令', actions: ['exec'] },
    { value: 'force', label: '强制删除', description: '即使正在使用也尝试删除', actions: ['remove-container','remove-image'] }, { value: 'volumes', label: '同时删除关联卷', description: '容器数据也可能被删除', actions: ['remove-container'] },
  ],
  git: [
    { value: 'all-files', label: '包含删除的文件', description: '暂存全部新增、修改和删除', actions: ['commit'] }, { value: 'push', label: '提交后立即推送', description: '完成提交后继续发送到远端', actions: ['commit'] },
    { value: 'rebase', label: '使用变基方式拉取', description: '保持提交记录为直线', actions: ['pull'] }, { value: 'set-upstream', label: '记录默认远端分支', description: '以后可以直接执行推送', actions: ['push'] },
    { value: 'graph', label: '显示分支关系图', description: '同时展示所有分支走向', actions: ['log'] }, { value: 'staged', label: '从暂存区撤回', description: '保留文件内容，只取消暂存', actions: ['restore'] },
    { value: 'force', label: '强制删除未合并分支', description: '未合并的提交可能丢失', actions: ['delete-branch'] }, { value: 'hard', label: '同时丢弃文件改动', description: '提交和本地文件都回到指定版本', actions: ['reset'] },
    { value: 'mixed', label: '保留文件但取消暂存', description: '默认只回退提交和暂存状态', actions: ['reset'] }, { value: 'no-edit', label: '使用默认撤销说明', description: '不再打开提交说明编辑器', actions: ['revert'] },
  ],
  curl: [
    { value: 'follow', label: '自动跟随跳转', description: '接口跳转后继续请求新网址', actions: ['get','post','put','patch','delete'] },
    { value: 'verbose', label: '显示详细过程', description: '输出请求和连接调试信息', actions: ['get','post','put','patch','delete'] },
  ],
}
const defaults: Record<CommandKind, string> = { maven: 'compile', docker: 'list', git: 'status', curl: 'get' }
const form = reactive<CommandForm>({ kind: 'maven', option: 'compile', target: '', secondary: '', content: '', extras: ['clean'], count: 10 })
const snapshots = new Map<string, CommandForm>()
const errors = computed(() => validateCommand(form))
const command = computed(() => Object.keys(errors.value).length ? '填写必要信息后，将在这里生成命令' : buildCommand(form))
const currentModifiers = computed(() => modifiers[form.kind].filter(item => item.actions.includes(form.option) && !(item.value === 'also-make' && !form.target.trim()) && !getConflictingOption(form, item.value)))
const needsTarget = computed(() => !(['maven:clean','docker:list','git:status','git:log'].includes(`${form.kind}:${form.option}`)))
const targetMeta = computed(() => {
  const map: Record<string, [string,string]> = {
    'maven:*': ['只处理哪个模块？（不填则处理整个项目）','例如：user-service'], 'docker:run': ['镜像名称','例如：nginx:latest'], 'docker:build': ['项目文件夹路径','例如：.'],
    'docker:remove-image': ['镜像名称或镜像编号','例如：my-app:latest'], 'docker:pull': ['镜像名称','例如：nginx:latest'], 'docker:push': ['镜像名称','例如：my-account/my-app:latest'],
    'git:commit': ['提交说明','例如：修复登录失败问题'], 'git:reset': ['要回退到的提交编号','例如：a1b2c3d'], 'git:revert': ['要撤销的提交编号','例如：a1b2c3d'],
    'git:add': ['要暂存的文件路径','全部文件可填写 .'], 'git:restore': ['要撤销的文件路径','例如：src/App.vue'], 'git:tag': ['版本标签名称','例如：v1.2.0'],
    'git:switch': ['要切换到的分支名称','例如：feature/login'], 'git:create-branch': ['新分支名称','例如：feature/login'], 'git:delete-branch': ['要删除的分支名称','例如：feature/old'],
    'git:pull': ['远端名称（可不填）','通常填写 origin'], 'git:push': ['远端名称（可不填）','通常填写 origin'], 'curl:*': ['请求网址','例如：https://api.example.com/users'],
  }
  return map[`${form.kind}:${form.option}`] ?? map[`${form.kind}:*`] ?? ['容器名称或容器编号','例如：web-server']
})
const risk = computed(() => {
  if (form.kind === 'docker' && form.option === 'remove-container') return form.extras?.includes('volumes') ? '删除容器及关联卷会造成数据丢失，请先确认数据已经备份。' : '删除容器后，容器内未挂载的数据将无法恢复。'
  if (form.kind === 'docker' && form.option === 'remove-image') return '删除镜像后，再次使用需要重新构建或下载。'
  if (form.kind === 'git' && form.option === 'reset') return form.extras?.includes('hard') ? '硬回退会永久丢弃指定提交之后的提交和本地文件改动。' : '仅适合尚未推送的提交；已推送的提交应选择“撤销已推送提交”。'
  if (form.kind === 'git' && ['delete-branch','restore','revert'].includes(form.option)) return actions.git.find(item => item.value === form.option)?.description ?? ''
  if (form.kind === 'curl' && form.option !== 'get') return '该请求可能修改服务器数据，请核对网址、内容和操作权限。'
  return ''
})

const commandParts = computed(() => command.value.split(/(\s+|&&)/).filter(Boolean).map(value => ({
  value,
  type: /^\s+$/.test(value) ? 'space' : value === '&&' ? 'join' : /^-/.test(value) ? 'option' : /^(mvn|docker|git|curl)$/.test(value) ? 'tool' : 'value',
})))
const explanation = computed(() => {
  if (Object.keys(errors.value).length) return ['请先填写必要信息，工具会在这里解释生成的命令。']
  const selected = new Set(form.extras ?? [])
  const result: string[] = []
  const action = actions[form.kind].find(item => item.value === form.option)
  if (action) result.push(action.description)
  if (form.target.trim()) result.push(`${(targetMeta.value[0] ?? '').replace(/[？（].*$/, '')}：${form.target.trim()}`)
  for (const item of currentModifiers.value) if (selected.has(item.value)) result.push(item.description)
  if (form.kind === 'git' && form.option === 'commit' && selected.has('push')) result.push(`提交完成后推送到 ${form.secondary}`)
  return result
})

function snapshotKey(kind = form.kind, option = form.option) { return `${kind}:${option}` }
function saveSnapshot() { snapshots.set(snapshotKey(), { ...form, extras: [...(form.extras ?? [])] }) }
function restore(kind: CommandKind, option: string) {
  const saved = snapshots.get(snapshotKey(kind, option))
  Object.assign(form, saved ?? { kind, option, target: '', secondary: '', content: '', extras: kind === 'maven' && ['compile', 'package', 'install', 'verify'].includes(option) ? ['clean'] : [], count: 10 })
}
function reset(kind: CommandKind) { saveSnapshot(); restore(kind, snapshots.get(`${kind}:${defaults[kind]}`)?.option ?? defaults[kind]) }
function selectAction(option: string) { saveSnapshot(); restore(form.kind, option) }
function toggleModifier(value: string) { const list = form.extras ?? []; form.extras = list.includes(value) ? list.filter(item => item !== value) : [...list, value] }
async function copy() { if (Object.keys(errors.value).length) return ElMessage.warning('请先填写标红的必要信息'); try { await navigator.clipboard.writeText(command.value); ElMessage.success('命令已复制') } catch { ElMessage.error('复制失败，请手动选择并复制命令') } }
</script>

<template><div class="sr-page command-page">
  <header class="list-heading"><div><p>命令助手</p><h1>命令模板</h1><span>选择动作并组合常用选项，生成完整命令。</span></div><TerminalSquare :size="30"/></header>
  <div class="command-workspace"><section class="steps sr-panel">
    <div class="step"><b>1</b><div><strong>选择核心指令</strong><span>先选场景，再选想完成的事情</span></div></div>
    <div class="kind-tabs"><button v-for="item in kinds" :key="item.value" :class="{active:form.kind===item.value}" @click="reset(item.value)"><strong>{{item.label}}</strong><span>{{item.description}}</span></button></div>
    <div class="action-label">要做什么？</div>
    <div class="action-grid"><button v-for="item in actions[form.kind]" :key="item.value" :class="{active:form.option===item.value,danger:item.danger}" @click="selectAction(item.value)"><strong>{{item.label}}</strong><span>{{item.description}}</span></button></div>
    <div class="step"><b>2</b><div><strong>填写必要信息</strong></div></div>
    <el-form label-position="top" class="builder">
      <el-form-item v-if="needsTarget || form.kind==='maven'" :label="targetMeta[0]" :error="errors.target"><el-input v-model="form.target" :placeholder="targetMeta[1]"/><div v-if="form.kind==='maven'" class="quick-values"><span>常用示例</span><button v-for="value in ['core','common','user-service','admin-api']" :key="value" type="button" @click="form.target=value">{{value}}</button></div></el-form-item>
      <el-form-item v-if="form.kind==='docker' && ['run','build'].includes(form.option)" :label="form.option==='run'?'容器名称（可不填）':'生成的镜像名称（可不填）'"><el-input v-model="form.secondary" :placeholder="form.option==='run'?'例如：web-server':'例如：my-app:latest'"/></el-form-item>
      <el-form-item v-if="form.kind==='docker' && form.option==='exec'" label="进入后运行什么？（不填则打开命令行）"><el-input v-model="form.secondary" placeholder="例如：/bin/bash"/></el-form-item>
      <el-form-item v-if="form.kind==='docker' && form.option==='logs'" label="最多查看多少行"><el-input-number v-model="form.count" :min="1" :max="10000"/></el-form-item>
      <template v-if="form.kind==='git' && ['pull','push'].includes(form.option)"><el-form-item label="分支名称（可不填）"><el-input v-model="form.secondary" placeholder="例如：main"/></el-form-item></template>
      <el-form-item v-if="form.kind==='git' && form.option==='commit' && form.extras?.includes('push')" label="推送到哪里" :error="errors.secondary"><el-input v-model="form.secondary" placeholder="例如：origin main"/></el-form-item>
      <el-form-item v-if="form.kind==='git' && form.option==='tag'" label="标签说明（可不填）"><el-input v-model="form.secondary" placeholder="例如：正式发布 1.2.0"/></el-form-item>
      <template v-if="form.kind==='curl'"><el-form-item v-if="form.option!=='get'" label="发送的数据格式"><el-select v-model="form.secondary"><el-option label="JSON 数据" value="application/json"/><el-option label="普通文本" value="text/plain"/><el-option label="表单数据" value="application/x-www-form-urlencoded"/></el-select></el-form-item><el-form-item v-if="['post','put','patch'].includes(form.option)" label="要发送的数据" :error="errors.content"><el-input v-model="form.content" type="textarea" :rows="4" placeholder="例如：{&quot;name&quot;:&quot;小明&quot;}"/></el-form-item></template>
    </el-form>
    <div v-if="currentModifiers.length" class="advanced">
      <div class="advanced-title"><b>3</b><span><strong>高级选项</strong><small>按需组合其他动作，不确定时可以跳过</small></span></div>
      <div class="modifier-grid"><button v-for="item in currentModifiers" :key="item.value" :class="{active:form.extras?.includes(item.value)}" @click="toggleModifier(item.value)"><span class="check">{{form.extras?.includes(item.value)?'✓':''}}</span><div><strong>{{item.label}}<el-tooltip :content="item.description" placement="top"><HelpCircle :size="14"/></el-tooltip></strong></div></button></div>
    </div>
    <p v-if="errors.options" class="option-error">{{errors.options}}</p>
  </section>
  <section class="result sr-panel"><div class="output-title"><div><strong>实时命令预览</strong><span>根据左侧选择自动更新</span></div></div>
    <div v-if="risk" class="risk"><AlertTriangle :size="18"/><div><strong>执行前请确认风险</strong><span>{{risk}}</span></div></div><pre :class="{empty:!!Object.keys(errors).length}"><code><span v-for="(part,index) in commandParts" :key="index" :class="`token-${part.type}`">{{part.value}}</span></code></pre>
    <el-button class="copy-command" :disabled="!!Object.keys(errors).length" @click="copy"><Copy :size="17"/>一键复制命令</el-button>
    <p class="local-note"><Check :size="15"/>这里只负责生成命令，不会自动执行，也不会上传填写的内容。</p>
    <details class="explanation" open><summary>这条命令会做什么？</summary><ol><li v-for="item in explanation" :key="item">{{item}}</li></ol></details>
  </section></div>
</div></template>

<style scoped lang="scss">
.command-workspace{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:14px;align-items:start}
.command-page{max-width:1100px;margin:0 auto}.steps,.result{padding:24px}.step{display:flex;align-items:center;gap:10px;margin:0 0 12px}.step:not(:first-child){margin-top:28px}.step b{display:grid;width:28px;height:28px;flex:none;place-items:center;border-radius:50%;background:var(--sr-blue);color:#fff}.step div,.risk div{display:flex;flex-direction:column}.step span{margin-top:2px;color:var(--sr-text-muted);font-size:12px}.kind-tabs,.action-grid,.modifier-grid{display:grid;gap:8px}.kind-tabs{grid-template-columns:repeat(4,1fr)}.action-grid{grid-template-columns:repeat(4,1fr)}.kind-tabs button,.action-grid button,.modifier-grid button{padding:12px;border:1px solid var(--sr-border);border-radius:6px;background:var(--sr-surface);color:var(--sr-text);cursor:pointer;text-align:left}.kind-tabs button{min-height:76px}.action-grid button{min-height:72px}.kind-tabs span,.action-grid span{display:block;margin-top:5px;color:var(--sr-text-muted);font-size:12px;line-height:1.45}.kind-tabs .active,.action-grid .active,.modifier-grid .active{border-color:var(--sr-blue);background:var(--sr-blue-soft);color:var(--sr-blue)}.action-grid .danger:not(.active){border-color:color-mix(in srgb,var(--sr-orange) 45%,var(--sr-border))}.builder{max-width:720px}.builder :deep(.el-select){width:100%}.modifier-grid{grid-template-columns:repeat(2,1fr)}.modifier-grid button{display:flex;align-items:flex-start;gap:10px;min-height:66px}.modifier-grid button:disabled{cursor:not-allowed;opacity:.42}.modifier-grid .check{display:grid;width:20px;height:20px;flex:none;place-items:center;border:1px solid var(--sr-border);border-radius:4px}.modifier-grid .active .check{border-color:var(--sr-blue);background:var(--sr-blue);color:#fff}.modifier-grid div{display:flex;flex-direction:column}.modifier-grid small{margin-top:4px;color:var(--sr-text-muted);font-size:12px;line-height:1.45}.result{margin-top:14px}.output-title{display:flex;align-items:center;justify-content:space-between}.risk{display:flex;gap:10px;margin-top:12px;padding:12px;border-left:3px solid var(--sr-orange);background:var(--sr-orange-soft);color:#8a4314}.risk svg{flex:none}.risk span{margin-top:3px;font-size:12px;line-height:1.6}pre{min-height:70px;margin:10px 0 12px;padding:18px;border-radius:6px;background:#17201b;color:#eaf4ed;overflow:auto;white-space:pre-wrap;word-break:break-all}.empty{color:#aab5af}.local-note{display:flex;align-items:center;gap:6px;margin:0;color:var(--sr-text-muted);font-size:12px}@media(max-width:850px){.action-grid{grid-template-columns:repeat(3,1fr)}}@media(max-width:680px){.kind-tabs,.action-grid,.modifier-grid{grid-template-columns:1fr 1fr}}@media(max-width:450px){.steps,.result{padding:16px}.kind-tabs,.action-grid,.modifier-grid{grid-template-columns:1fr}}
.option-error{margin:8px 0 0;color:#c43f3f;font-size:12px}
.command-page{max-width:1280px}.steps,.result{padding:20px}.result{position:sticky;top:16px;margin-top:0}.step:not(:first-child){margin-top:20px}.kind-tabs button{min-height:64px;padding:10px}.action-grid button{min-height:58px;padding:9px 10px}.kind-tabs span,.action-grid span{display:-webkit-box;margin-top:3px;overflow:hidden;-webkit-box-orient:vertical;-webkit-line-clamp:2;font-size:11px;line-height:1.35}.modifier-grid button{min-height:54px;padding:9px}.modifier-grid small{margin-top:2px;line-height:1.35}.builder :deep(.el-form-item){margin-bottom:14px}.result pre{min-height:110px;max-height:42vh}.local-note{align-items:flex-start;line-height:1.5}
@media(max-width:960px){.command-workspace{grid-template-columns:1fr}.result{position:static;grid-row:1;margin-bottom:0}.steps{grid-row:2}.action-grid{grid-template-columns:repeat(4,1fr)}}
@media(max-width:680px){.result{grid-row:2}.steps{grid-row:1}.action-grid{grid-template-columns:1fr 1fr}}
.action-label{margin:0 0 8px;color:var(--sr-text-muted);font-size:12px;font-weight:600}.quick-values{display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin-top:6px;color:var(--sr-text-muted);font-size:11px}.quick-values button{padding:2px 7px;border:1px solid var(--sr-border);border-radius:4px;background:var(--sr-surface);color:var(--sr-blue);font-size:11px;cursor:pointer}.advanced{margin-top:18px;border-top:1px solid var(--sr-border);padding-top:12px}.advanced-toggle{display:flex;width:100%;align-items:center;justify-content:space-between;padding:0;border:0;background:none;color:var(--sr-text);cursor:pointer;text-align:left}.advanced-toggle>span{display:flex;align-items:center;gap:9px}.advanced-toggle b{display:grid;width:24px;height:24px;place-items:center;border-radius:50%;background:var(--sr-blue);color:#fff;font-size:12px}.advanced-toggle span span{display:flex;flex-direction:column}.advanced-toggle small{margin-top:2px;color:var(--sr-text-muted);font-size:11px}.advanced-toggle svg{transition:transform .15s}.advanced-toggle svg.open{transform:rotate(180deg)}.modifier-grid{margin-top:10px}.modifier-grid button strong{display:flex;align-items:center;gap:5px}.modifier-grid button strong svg{color:var(--sr-blue)}.output-title span{display:block;margin-top:3px;color:var(--sr-text-muted);font-size:11px}.result pre{font-size:13px;line-height:1.7}.token-tool{color:#65a4ff}.token-option{color:#7ed49b}.token-value{color:#f4c477}.token-join{color:#c99cff}.token-space{white-space:pre}.copy-command{width:100%;margin-bottom:12px}.explanation{border-top:1px solid var(--sr-border);padding-top:10px;color:var(--sr-text-muted);font-size:12px}.explanation summary{color:var(--sr-text);font-weight:600;cursor:pointer}.explanation ol{margin:8px 0 0;padding-left:20px;line-height:1.7}
.action-label{margin:20px 0!important}.advanced-title{display:flex;align-items:center;gap:9px}.advanced-title b{display:grid;width:24px;height:24px;place-items:center;border-radius:50%;background:var(--sr-blue);color:#fff;font-size:12px}.advanced-title strong{font-size:14px}.local-note{margin-top:14px;padding-top:12px;border-top:1px solid var(--sr-border)}.explanation{border-top:0!important;padding-top:10px}
.advanced-title>span{display:flex;flex-direction:column}.advanced-title small{margin-top:2px;color:var(--sr-text-muted);font-size:11px;font-weight:400}.modifier-grid button{min-height:0;padding:10px 12px;align-items:center}.modifier-grid .check{width:19px;height:19px}.modifier-grid button strong{line-height:1.35}
.step b,.advanced-title b{width:28px;height:28px;flex:none}.advanced-title b{font-size:14px}
</style>

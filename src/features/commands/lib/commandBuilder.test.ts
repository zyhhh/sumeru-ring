import { describe, expect, it } from 'vitest'
import { buildCommand, validateCommand } from './commandBuilder'

describe('命令生成器', () => {
  it('Maven 可以只编译当前模块', () => {
    expect(buildCommand({ kind: 'maven', option: 'compile', target: 'web app', extras: ['clean'] })).toBe("mvn clean compile -pl 'web app'")
  })

  it('Maven 可以连同依赖模块一起编译', () => {
    expect(buildCommand({ kind: 'maven', option: 'compile', target: 'web', extras: ['also-make', 'skip-tests'] })).toBe('mvn compile -pl web -am -DskipTests')
  })

  it('Maven 离线执行与强制更新互斥', () => {
    const form = { kind: 'maven' as const, option: 'compile', target: '', extras: ['offline', 'update'] }
    expect(validateCommand(form).options).toContain('互相冲突')
    expect(() => buildCommand(form)).toThrow('离线模式禁止联网')
  })

  it('Maven 同时构建依赖前必须指定模块', () => {
    expect(validateCommand({ kind: 'maven', option: 'compile', target: '', extras: ['also-make'] }).target).toContain('先输入要构建的模块')
  })

  it('Docker 可以强制删除容器和关联卷', () => {
    expect(buildCommand({ kind: 'docker', option: 'remove-container', target: 'old-web', extras: ['force', 'volumes'] })).toBe('docker rm -f -v old-web')
  })

  it('Git 提交后可以继续推送', () => {
    expect(buildCommand({ kind: 'git', option: 'commit', target: '修复登录', secondary: 'origin main', extras: ['all-files', 'push'] })).toBe("git add -A && git commit -m '修复登录' && git push origin main")
  })

  it('Git 未推送提交可选择硬回退', () => {
    expect(buildCommand({ kind: 'git', option: 'reset', target: 'a1b2c3d', extras: ['hard'] })).toBe('git reset --hard a1b2c3d')
  })

  it('Git 两种本地回退方式互斥', () => {
    expect(() => buildCommand({ kind: 'git', option: 'reset', target: 'a1b2c3d', extras: ['hard', 'mixed'] })).toThrow('不能同时选择')
  })

  it('Git 设置默认远端分支时要求填写远端和分支', () => {
    expect(validateCommand({ kind: 'git', option: 'push', target: '', secondary: '', extras: ['set-upstream'] })).toMatchObject({ target: expect.any(String), secondary: expect.any(String) })
  })

  it('Git 已推送提交使用反向提交撤销', () => {
    expect(buildCommand({ kind: 'git', option: 'revert', target: 'a1b2c3d', extras: ['no-edit'] })).toBe('git revert --no-edit a1b2c3d')
  })

  it('缺少网址时错误归属于目标输入框', () => {
    expect(validateCommand({ kind: 'curl', option: 'get', target: '' })).toEqual({ target: '请输入请求网址' })
  })

  it('写入接口缺少内容时错误归属于内容输入框', () => {
    expect(validateCommand({ kind: 'curl', option: 'post', target: 'https://api.test/items', content: '' })).toEqual({ content: '请输入要发送的数据内容' })
  })
})

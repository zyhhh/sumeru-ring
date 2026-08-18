<script setup lang="ts">
import { computed, reactive } from 'vue'
import { Check, Copy, TerminalSquare } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { buildCommand, type CommandKind } from '../lib/commandBuilder'

const kinds: { value: CommandKind; label: string }[] = [
  { value: 'maven', label: 'Maven' }, { value: 'docker', label: 'Docker' },
  { value: 'git', label: 'Git' }, { value: 'curl', label: 'curl' },
]
const options: Record<CommandKind, string[]> = {
  maven: ['clean package', 'clean install', 'test', 'dependency:tree'],
  docker: ['run', 'build', 'logs', 'exec'],
  git: ['status', 'checkout', 'pull', 'log'],
  curl: ['-X GET', '-X POST', '-X PUT', '-X DELETE'],
}
const placeholders: Record<CommandKind, string> = { maven: '模块名（可选）', docker: '镜像、容器或路径', git: '分支、文件或远程名（可选）', curl: 'https://api.example.com/resource' }
const form = reactive({ kind: 'maven' as CommandKind, target: '', option: 'clean package', extra: '-DskipTests' })
const command = computed(() => buildCommand(form))

function changeKind(kind: CommandKind) {
  form.kind = kind
  form.option = options[kind][0] ?? ''
  form.target = ''
  form.extra = ''
}
async function copy() {
  await navigator.clipboard.writeText(command.value)
  ElMessage.success('命令已复制')
}
</script>

<template>
  <div class="sr-page command-page">
    <header class="list-heading"><div><p>COMMAND TEMPLATES</p><h1>命令模板</h1><span>填写常用参数，生成可直接执行的命令。</span></div><TerminalSquare :size="30" /></header>
    <div class="kind-tabs" role="tablist"><el-button v-for="item in kinds" :key="item.value" :class="{ active: form.kind === item.value }" @click="changeKind(item.value)">{{ item.label }}</el-button></div>
    <section class="builder sr-panel">
      <el-form label-position="top">
        <el-form-item label="操作"><el-select v-model="form.option"><el-option v-for="item in options[form.kind]" :key="item" :label="item" :value="item" /></el-select></el-form-item>
        <el-form-item label="目标"><el-input v-model="form.target" :placeholder="placeholders[form.kind]" /></el-form-item>
        <el-form-item label="附加参数"><el-input v-model="form.extra" placeholder="可选，例如：--force" /></el-form-item>
      </el-form>
      <div class="output-title"><span>生成结果</span><el-button text circle title="复制命令" aria-label="复制命令" @click="copy"><Copy :size="17" /></el-button></div>
      <pre><code>{{ command }}</code></pre>
      <p class="local-note"><Check :size="15" />参数仅在当前页面处理，不会执行或上传命令。</p>
    </section>
  </div>
</template>

<style scoped lang="scss">
.command-page{max-width:1000px;margin:0 auto}.kind-tabs{display:flex;gap:8px;margin-bottom:14px}.kind-tabs .active{border-color:var(--sr-blue);background:var(--sr-blue-soft);color:var(--sr-blue)}.builder{padding:24px}.builder :deep(.el-select){width:100%}.output-title{display:flex;align-items:center;justify-content:space-between;margin-top:8px;font-weight:600}pre{min-height:92px;margin:6px 0 12px;padding:18px;border-radius:6px;background:#17201b;color:#eaf4ed;overflow:auto;white-space:pre-wrap;word-break:break-all}.local-note{display:flex;align-items:center;gap:6px;margin:0;color:var(--sr-text-muted);font-size:12px}@media(max-width:560px){.kind-tabs{display:grid;grid-template-columns:1fr 1fr}.builder{padding:18px}}
</style>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { ElMessage, type UploadFile } from 'element-plus'
import ToolDocumentation from '@/components/tool/ToolDocumentation.vue'
import ToolPageHeader from '@/components/tool/ToolPageHeader.vue'
import type { JsonAction, JsonResult } from '../lib/jsonProcessor'

const input = ref('')
const output = ref('')
const action = ref<JsonAction>('format')
const loading = ref(false)
const error = ref('')
const search = ref('')
const searchIndex = ref(0)
const fontSize = 14
const collapsed = ref<Set<number>>(new Set())
const codeView = ref<HTMLElement | null>(null)
let worker: Worker | null = null

const displayOutput = computed(() => {
  if (!output.value || output.value.includes('\n') || output.value.length < 20000) return output.value
  try { return JSON.stringify(JSON.parse(output.value), null, 2) }
  catch { return output.value.match(/.{1,2000}/gs)?.join('\n') ?? output.value }
})
const resultLines = computed(() => displayOutput.value ? displayOutput.value.split('\n') : [])
const inputSize = computed(() => { const bytes = new Blob([input.value]).size; return bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB` })
const foldBlocks = computed(() => {
  const stack: number[] = []; const blocks = new Map<number, { end: number; count: number }>()
  resultLines.value.forEach((line, index) => {
    const trimmed = line.trim()
    if (/^[\]}]/.test(trimmed) && stack.length) { const start = stack.pop()!; const source = resultLines.value[start] ?? ''; const indent = (source.match(/^\s*/) || [''])[0].length; const count = resultLines.value.slice(start + 1, index).filter(child => { const value = child.trim(); return value && !/^[\]}]/.test(value) && (child.match(/^\s*/) || [''])[0].length === indent + 2 }).length; blocks.set(start, { end: index, count }) }
    if (/[\[{]\s*$/.test(trimmed)) stack.push(index)
  }); return blocks
})
const visibleLines = computed(() => {
  return resultLines.value.map((line, index) => { let hidden = false; collapsed.value.forEach(start => { const block = foldBlocks.value.get(start); if (block && index > start && index <= block.end) hidden = true }); return { line, index, hidden, match: !!search.value && line.toLowerCase().includes(search.value.toLowerCase()) } }).filter(item => !item.hidden)
})

function highlight(line: string) {
  const escaped = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  return escaped.replace(/("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\b\d+(?:\.\d+)?\b)/g, (match, key, string, literal, number) => key ? `<span class="json-key">${key}</span>` : string ? `<span class="json-string">${string}</span>` : literal ? `<span class="json-literal">${literal}</span>` : `<span class="json-number">${number}</span>`)
}

function toggle(index: number) {
  const next = new Set(collapsed.value)
  next.has(index) ? next.delete(index) : next.add(index)
  collapsed.value = next
}

function locateSearch() {
  searchIndex.value = 0
  if (!search.value) return
  const found = resultLines.value.findIndex(line => line.toLowerCase().includes(search.value.toLowerCase()))
  if (found < 0) return
  const next = new Set(collapsed.value)
  for (let i = 0; i < found; i++) next.delete(i)
  collapsed.value = next
}
const matches = computed(() => search.value ? resultLines.value.map((line, index) => line.toLowerCase().includes(search.value.toLowerCase()) ? index : -1).filter(index => index >= 0) : [])
function jump(step: number) { if (!matches.value.length) return; searchIndex.value = (searchIndex.value + step + matches.value.length) % matches.value.length; const found = matches.value[searchIndex.value] ?? 0; const next = new Set(collapsed.value); for (let i = 0; i < found; i++) next.delete(i); collapsed.value = next; requestAnimationFrame(() => { const line = codeView.value?.querySelector<HTMLElement>(`.code-line[data-line="${found}"]`); if (line && codeView.value) codeView.value.scrollTop = line.offsetTop - codeView.value.clientHeight / 2 }) }
function canFold(line: string) { return /[\[{]\s*$/.test(line.trim()) }
function foldCount(index: number) { return foldBlocks.value.get(index)?.count ?? 0 }
function clearAll() { input.value = ''; output.value = ''; error.value = ''; search.value = ''; searchIndex.value = 0; collapsed.value = new Set() }

function run() {
  error.value = ''
  loading.value = true
  worker?.terminate()
  worker = new Worker(new URL('../json.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: JsonResult; error?: string }>) => {
    loading.value = false
    if (event.data.ok && event.data.result) { output.value = event.data.result.value; collapsed.value = new Set() }
    else error.value = enhanceError(event.data.error ?? '处理失败')
  }
  worker.postMessage({ input: input.value, action: action.value })
}

function enhanceError(message: string) {
  const match = message.match(/position (\d+)/)
  if (!match) return message
  const position = Number(match[1])
  const before = input.value.slice(0, position)
  const line = before.split('\n').length
  const column = position - (before.lastIndexOf('\n') + 1) + 1
  return `${message}（第 ${line} 行，第 ${column} 列）`
}

// ElUpload 仅负责统一文件选择交互，文件仍在当前浏览器本地读取。
function upload(uploadFile: UploadFile) {
  const file = uploadFile.raw
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    error.value = '文件超过 10 MB，首版建议处理 1-10 MB 的 JSON。'
    return
  }
  file.text().then((value) => { input.value = value })
}

async function copy() {
  await navigator.clipboard.writeText(output.value)
  ElMessage.success('结果已复制')
}

async function copyMinified() {
  try {
    await navigator.clipboard.writeText(JSON.stringify(JSON.parse(output.value)))
    ElMessage.success('压缩结果已复制')
  } catch {
    ElMessage.error('当前结果不是合法 JSON，无法压缩复制')
  }
}

function download() {
  const blob = new Blob([output.value], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = 'sumeru-ring-result.json'
  anchor.click()
  URL.revokeObjectURL(url)
}

onBeforeUnmount(() => worker?.terminate())
const docs = [
  { title: '支持的操作', content: '格式化与压缩会先校验 JSON；转义适合把文本放入 JSON 字符串；去转义用于还原反斜杠转义序列。' },
  { title: '大数据处理', content: '1-10 MB 内容交给 Web Worker 处理，主页面仍可响应。处理耗时取决于设备性能和数据层级。' },
  { title: '错误定位', content: '解析失败时会根据浏览器提供的位置换算行列。不同浏览器的原始错误文案可能略有差异。' },
]
</script>

<template>
  <div class="sr-page">
    <ToolPageHeader category="开发辅助" title="JSON 工具" description="格式化、压缩、转义或还原 JSON，计算过程不阻塞主页面。" :tags="['JSON', '格式化']" />
    <section class="json-tool sr-panel">
      <div class="toolbar">
        <el-radio-group v-model="action"><el-radio-button value="format">格式化</el-radio-button><el-radio-button value="escape">转义</el-radio-button><el-radio-button value="unescape">去转义</el-radio-button></el-radio-group>
      </div>
      <div class="editors">
        <section class="editor-column"><div class="editor-header"><strong>输入</strong><span class="size">{{ inputSize }}</span><div class="panel-actions"><el-button class="process-button" type="primary" :loading="loading" @click="run">开始处理</el-button><el-upload :auto-upload="false" :show-file-list="false" accept=".json,application/json,text/plain" :on-change="upload"><el-button>上传</el-button></el-upload><el-button @click="clearAll">清空</el-button></div></div><textarea v-model="input" spellcheck="false" placeholder="粘贴 JSON 或文本"></textarea></section>
        <section class="editor-column"><div class="editor-header result-header"><strong>结果</strong><div v-if="output" class="result-actions"><el-input v-model="search" clearable placeholder="搜索结果" @input="locateSearch"><template #prefix><span class="search-icon">⌕</span></template></el-input><el-button @click="jump(-1)" :disabled="!matches.length">上一个</el-button><el-button @click="jump(1)" :disabled="!matches.length">下一个</el-button><span v-if="matches.length" class="match-count">{{ searchIndex + 1 }} / {{ matches.length }}</span><el-dropdown split-button @click="copy" @command="copyMinified">复制结果<template #dropdown><el-dropdown-menu><el-dropdown-item command="minify">压缩复制</el-dropdown-item></el-dropdown-menu></template></el-dropdown><el-button @click="download">下载</el-button></div></div><div ref="codeView" class="code-view" :style="{ fontSize: `${fontSize}px` }"><div v-for="item in visibleLines" :key="item.index" :data-line="item.index" class="code-line" :class="{ match: item.match }"><button v-if="canFold(item.line)" class="fold" :class="{ closed: collapsed.has(item.index) }" @click.stop="toggle(item.index)">{{ collapsed.has(item.index) ? '+' : '−' }}</button><span v-else class="fold-space"></span><span class="line-number">{{ item.index + 1 }}</span><code v-html="highlight(item.line)"></code><span v-if="collapsed.has(item.index)" class="fold-count">… {{ foldCount(item.index) }} 项</span></div><div v-if="!output" class="empty">处理结果将在此展示</div></div></section>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </section>
    <ToolDocumentation :sections="docs" />
  </div>
</template>

<style scoped lang="scss">
.json-tool{padding:20px}.toolbar{display:flex;align-items:center;margin-bottom:16px}.editors{display:grid;grid-template-columns:minmax(300px,1fr) minmax(0,1.7fr);gap:14px}.editor-column{min-width:0}.editor-header{display:flex;min-height:40px;align-items:center;gap:10px;color:var(--sr-text-muted);font-size:13px}.editor-header strong{color:#218a5a;font-size:15px}.editor-header .size{white-space:nowrap}.panel-actions{display:flex;align-items:center;gap:8px;margin-left:auto}.process-button{--el-button-bg-color:#f26b21;--el-button-border-color:#f26b21;--el-button-hover-bg-color:#ff7d36;--el-button-hover-border-color:#ff7d36;--el-button-active-bg-color:#d95816;--el-button-active-border-color:#d95816}.result-actions{display:flex;min-width:0;align-items:center;gap:6px;margin-left:auto}.result-actions .el-input{width:190px}.match-count{min-width:48px;text-align:center;white-space:nowrap}.search-icon{display:inline-flex;font-size:24px;font-weight:700;line-height:1}.editors textarea,.code-view{display:block;box-sizing:border-box;width:100%;height:620px;margin-top:8px;padding:14px;border:1px solid var(--sr-border);border-radius:var(--sr-radius-control);resize:none;background:var(--sr-surface-soft);color:var(--sr-text);font:14px/1.7 ui-monospace,monospace}.editors textarea:focus{outline:0;border-color:var(--sr-blue)}.code-view{position:relative;overflow:auto}.code-line{display:flex;align-items:center;min-width:max-content;min-height:23.8px;white-space:pre}.code-line.match{background:#fff2b8}.line-number{width:48px;flex:none;text-align:right;padding-right:14px;color:#9aa4b2;line-height:23.8px;user-select:none}.fold,.fold-space{display:inline-flex;width:24px;height:23.8px;flex:none;align-items:center;justify-content:center;padding:0;border:0;background:none}.fold{color:#218a5a;font-size:18px;font-weight:700;cursor:pointer}.fold.closed{color:#df6b2f}.fold-count{color:#87909f;font-size:12px;margin-left:7px}:deep(.json-key){color:#8b5cf6}:deep(.json-string){color:#16803c}:deep(.json-number){color:#c2410c}:deep(.json-literal){color:#0284c7}.empty{color:var(--sr-text-muted);padding:10px}.error{padding:11px;background:#fdeaea;color:#c43f3f;font-size:13px}
@media(max-width:1000px){.editors{grid-template-columns:1fr}.result-header{flex-wrap:wrap}.result-actions{width:100%;margin-left:0}.editors textarea,.code-view{height:480px}}
</style>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { ChevronDown, ChevronUp } from 'lucide-vue-next'
import ToolDocumentation from '@/components/tool/ToolDocumentation.vue'
import ToolPageHeader from '@/components/tool/ToolPageHeader.vue'
import { compactRows, type DiffRow, type TextDiffResult, type VisibleDiffItem } from '../lib/textDiff'

const original = ref('')
const modified = ref('')
const ignoreWhitespace = ref(false)
const result = ref<TextDiffResult | null>(null)
const loading = ref(false)
const error = ref('')
const activeDifference = ref(0)
const onlyDifferences = ref(false)
const expandedGaps = ref<Set<string>>(new Set())
const leftResult = ref<HTMLElement | null>(null)
const rightResult = ref<HTMLElement | null>(null)
let worker: Worker | null = null
let syncing = false

const hasDifferences = computed(() => !!result.value?.stats.total)
const currentDifferenceId = computed(() => result.value?.differenceIds[activeDifference.value])
const visibleItems = computed<VisibleDiffItem[]>(() => {
  if (!result.value) return []
  if (!onlyDifferences.value) return result.value.rows.map(row => ({ type: 'row', row }))
  return compactRows(result.value.rows).flatMap(item => item.type === 'gap' && expandedGaps.value.has(item.id) ? item.rows.map(row => ({ type: 'row' as const, row })) : [item])
})

watch(onlyDifferences, enabled => {
  if (!enabled) expandedGaps.value = new Set()
})

function compare() {
  error.value = ''
  loading.value = true
  activeDifference.value = 0
  expandedGaps.value = new Set()
  worker?.terminate()
  worker = new Worker(new URL('../text-diff.worker.ts', import.meta.url), { type: 'module' })
  worker.onmessage = (event: MessageEvent<{ ok: boolean; result?: TextDiffResult; error?: string }>) => {
    loading.value = false
    if (event.data.ok && event.data.result) {
      result.value = event.data.result
      nextTick(() => { if (leftResult.value) leftResult.value.scrollTop = 0; if (rightResult.value) rightResult.value.scrollTop = 0 })
    } else error.value = event.data.error ?? '文本比较失败'
  }
  worker.postMessage({ original: original.value, modified: modified.value, ignoreWhitespace: ignoreWhitespace.value })
}

function clear() {
  original.value = ''; modified.value = ''; result.value = null; error.value = ''; activeDifference.value = 0; expandedGaps.value = new Set()
  worker?.terminate(); worker = null
}

function syncScroll(source: HTMLElement, target: HTMLElement | null) {
  if (syncing || !target) return
  syncing = true
  target.scrollTop = source.scrollTop
  target.scrollLeft = source.scrollLeft
  requestAnimationFrame(() => { syncing = false })
}

function jump(step: number) {
  const ids = result.value?.differenceIds ?? []
  if (!ids.length) return
  activeDifference.value = (activeDifference.value + step + ids.length) % ids.length
  nextTick(() => {
    const id = ids[activeDifference.value]
    const row = leftResult.value?.querySelector<HTMLElement>(`[data-difference="${id}"]`)
    if (!row) return
    const top = Math.max(0, row.offsetTop - 80)
    if (leftResult.value) leftResult.value.scrollTop = top
    if (rightResult.value) rightResult.value.scrollTop = top
  })
}

function rowClass(row: DiffRow, side: 'left' | 'right') {
  return [`diff-${side}-${row.kind}`, { current: row.differenceId === currentDifferenceId.value }]
}
function expandGap(id: string) { expandedGaps.value = new Set(expandedGaps.value).add(id) }

onBeforeUnmount(() => worker?.terminate())

const docs = [
  { title: '比较规则', content: '先按行识别新增、删除和修改，再在修改行内标记具体变化。默认会统计空白差异。' },
  { title: '同步浏览', content: '左右结果区同步滚动；使用上一个和下一个按钮可以逐个查看连续差异块。' },
  { title: '本地处理', content: '文本仅在当前浏览器内通过 Web Worker 比较，不会上传到服务器。' },
]
</script>

<template>
  <div class="sr-page">
    <ToolPageHeader category="文本处理" title="文本比较" description="以 Git 风格查看两段文本的行级和行内差异。" :tags="['文本', 'Diff']" />
    <section class="diff-tool sr-panel">
      <div class="input-toolbar">
        <el-button class="sr-primary-button" type="primary" :loading="loading" @click="compare">开始比较</el-button>
        <el-button @click="clear">清空</el-button>
        <!--<el-switch v-model="ignoreWhitespace" active-text="忽略空白" />-->
      </div>
      <div class="inputs">
        <label><span>原始文本</span><textarea v-model="original" spellcheck="false" placeholder="粘贴原始文本"></textarea></label>
        <label><span>修改后文本</span><textarea v-model="modified" spellcheck="false" placeholder="粘贴修改后的文本"></textarea></label>
      </div>
      <p v-if="error" class="error">{{ error }}</p>
    </section>

    <section v-if="result" class="result-section sr-panel">
      <div class="result-toolbar">
        <div class="stats"><span class="added">新增 {{ result.stats.added }}</span><span class="removed">删除 {{ result.stats.removed }}</span><span class="modified">修改 {{ result.stats.modified }}</span><b>差异 {{ result.stats.total }}</b></div>
        <div class="navigation"><el-switch v-model="onlyDifferences" active-text="只看差异" /><el-button :icon="ChevronUp" :disabled="!hasDifferences" title="上一个差异" @click="jump(-1)">上一个</el-button><span>{{ hasDifferences ? `${activeDifference + 1} / ${result.stats.total}` : '0 / 0' }}</span><el-button :icon="ChevronDown" :disabled="!hasDifferences" title="下一个差异" @click="jump(1)">下一个</el-button></div>
      </div>
      <div v-if="!hasDifferences" class="identical">文本内容一致</div>
      <div v-else class="diff-results">
        <div class="result-pane"><div class="pane-title">原始文本</div><div ref="leftResult" class="diff-scroll" @scroll="syncScroll($event.currentTarget as HTMLElement, rightResult)"><template v-for="item in visibleItems" :key="item.type === 'row' ? item.row.id : item.id"><button v-if="item.type === 'gap'" class="diff-gap" @click="expandGap(item.id)">已隐藏 {{ item.count }} 行，点击展开</button><div v-else class="diff-row" :class="rowClass(item.row, 'left')" :data-difference="item.row.differenceId"><span class="marker">{{ item.row.left ? (item.row.kind === 'same' ? ' ' : '−') : ' ' }}</span><span class="line-number">{{ item.row.left?.lineNumber ?? '' }}</span><code><template v-if="item.row.left"><span v-for="(segment, index) in item.row.left.segments" :key="index" :class="`segment-${segment.kind}`">{{ segment.text }}</span></template></code></div></template></div></div>
        <div class="result-pane"><div class="pane-title">修改后文本</div><div ref="rightResult" class="diff-scroll" @scroll="syncScroll($event.currentTarget as HTMLElement, leftResult)"><template v-for="item in visibleItems" :key="item.type === 'row' ? item.row.id : item.id"><button v-if="item.type === 'gap'" class="diff-gap" @click="expandGap(item.id)">已隐藏 {{ item.count }} 行，点击展开</button><div v-else class="diff-row" :class="rowClass(item.row, 'right')" :data-difference="item.row.differenceId"><span class="marker">{{ item.row.right ? (item.row.kind === 'same' ? ' ' : '+') : ' ' }}</span><span class="line-number">{{ item.row.right?.lineNumber ?? '' }}</span><code><template v-if="item.row.right"><span v-for="(segment, index) in item.row.right.segments" :key="index" :class="`segment-${segment.kind}`">{{ segment.text }}</span></template></code></div></template></div></div>
      </div>
    </section>
    <ToolDocumentation :sections="docs" />
  </div>
</template>

<style scoped lang="scss">
.diff-tool,.result-section{padding:20px}.input-toolbar,.result-toolbar,.navigation,.stats{display:flex;align-items:center;gap:9px}.input-toolbar{margin-bottom:14px}.input-toolbar .el-switch{margin-left:auto}.inputs,.diff-results{display:grid;grid-template-columns:1fr 1fr;gap:12px}.inputs label{color:#218a5a;font-size:15px;font-weight:700}.inputs textarea{box-sizing:border-box;width:100%;height:220px;margin-top:8px;padding:13px;border:1px solid var(--sr-border);border-radius:var(--sr-radius-control);resize:none;background:var(--sr-surface-soft);color:var(--sr-text);font:14px/1.65 ui-monospace,monospace}.inputs textarea:focus{outline:0;border-color:var(--sr-blue)}.error{padding:10px;background:#fdeaea;color:#c43f3f}.result-section{margin-top:14px}.result-toolbar{justify-content:space-between;margin-bottom:12px}.stats span,.stats b{padding:5px 8px;border-radius:4px;font-size:12px}.stats .added{background:#e8f7ed;color:#16803c}.stats .removed{background:#fdecec;color:#c43f3f}.stats .modified{background:#fff1db;color:#b85b18}.stats b{background:var(--sr-surface-soft)}.navigation>span{min-width:52px;text-align:center;font-size:13px}.result-pane{min-width:0;border:1px solid var(--sr-border);border-radius:var(--sr-radius-control);overflow:hidden}.pane-title{padding:9px 12px;border-bottom:1px solid var(--sr-border);background:var(--sr-surface-soft);color:var(--sr-text);font-size:13px;font-weight:700}.diff-scroll{position:relative;height:680px;overflow:auto;background:#fff}.diff-row{display:flex;align-items:stretch;min-width:max-content;min-height:24px;font:13px/24px ui-monospace,monospace;white-space:pre}.diff-row.current{box-shadow:inset 3px 0 #e8792f}.marker{width:24px;flex:none;text-align:center;font-weight:700;user-select:none}.line-number{width:48px;flex:none;padding-right:10px;border-right:1px solid rgba(0,0,0,.06);color:#8b96a5;text-align:right;user-select:none}.diff-row code{display:block;min-width:calc(100% - 72px);padding:0 10px;color:var(--sr-text);font:inherit}.diff-left-removed,.diff-left-modified{background:#fff0f0}.diff-right-added,.diff-right-modified{background:#ecf8ef}.diff-left-added,.diff-right-removed{background:#f6f7f8}.segment-removed{background:#f3b7b7;color:#8d2020}.segment-added{background:#aee2bd;color:#145c2c}.identical{padding:48px;text-align:center;color:#218a5a;font-weight:700}
.diff-gap{display:block;width:100%;height:30px;padding:0;border:0;border-top:1px solid #d9e0e5;border-bottom:1px solid #d9e0e5;background:#f2f5f7;color:#667281;font-size:12px;line-height:28px;text-align:center;cursor:pointer}.diff-gap:hover{background:#e8eef2;color:#2f6f91}
@media(max-width:800px){.inputs,.diff-results{grid-template-columns:1fr}.result-toolbar{align-items:flex-start;flex-direction:column}.input-toolbar{flex-wrap:wrap}.input-toolbar .el-switch{margin-left:0}.diff-scroll{height:480px}}
</style>

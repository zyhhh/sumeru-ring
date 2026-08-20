<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpenCheck, Copy, Search } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { cheatsheets, regexExamples } from '../cheatsheetData'

const activeId = ref(cheatsheets[0]?.id ?? '')
const query = ref('')
const active = computed(() => cheatsheets.find(({ id }) => id === activeId.value) ?? cheatsheets[0])
const entries = computed(() => {
  const text = query.value.trim().toLocaleLowerCase()
  return active.value?.entries.filter((item) => !text || [item.key, item.syntax, item.description].join(' ').toLocaleLowerCase().includes(text)) ?? []
})
async function copy(value: string) { await navigator.clipboard.writeText(value); ElMessage.success('已复制') }
</script>

<template>
  <div class="sr-page sheet-page">
    <header class="list-heading"><div><p>开发速查</p><h1>速查表</h1><span>集中查阅开发中容易忘记的状态码、命令与语法。</span></div><BookOpenCheck :size="30" /></header>
    <div class="sheet-tabs"><el-button v-for="sheet in cheatsheets" :key="sheet.id" :class="{ active: activeId === sheet.id }" @click="activeId = sheet.id">{{ sheet.title }}</el-button></div>
    <section class="sheet-panel sr-panel">
      <div class="sheet-heading"><div><h2>{{ active?.title }}</h2><span>{{ entries.length }} 条</span></div><el-input v-model="query" clearable placeholder="搜索当前速查表"><template #prefix><Search :size="15" /></template></el-input></div>
      <div class="entry-list">
        <div v-for="item in entries" :key="`${item.key}-${item.syntax}`" class="entry-row"><strong>{{ item.key }}</strong><code>{{ item.syntax }}</code><span>{{ item.description }}</span><el-button text circle title="复制" @click="copy(item.syntax)"><Copy :size="15" /></el-button></div>
      </div>
      <div v-if="active?.id === 'regex' && !query.trim()" class="regex-examples">
        <h3>常用正则示例</h3>
        <div class="example-grid"><div v-for="item in regexExamples" :key="item.title" class="regex-example"><strong>{{ item.title }}</strong><code>{{ item.pattern }}</code><span><b>示例：</b>{{ item.text }}。{{ item.explanation }}</span><el-button text circle title="复制正则" @click="copy(item.pattern)"><Copy :size="15" /></el-button></div></div>
      </div>
      <el-empty v-if="!entries.length" description="没有匹配的条目" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.sheet-page{max-width:1280px;margin:0 auto}.sheet-tabs{display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px}.sheet-tabs .active{border-color:var(--sr-blue);background:var(--sr-blue-soft);color:var(--sr-blue)}.sheet-panel{padding:16px}.sheet-heading{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-bottom:10px}.sheet-heading>div{display:flex;align-items:baseline;gap:8px}.sheet-heading h2{margin:0;font-size:17px}.sheet-heading span{color:var(--sr-text-muted);font-size:12px}.sheet-heading .el-input{width:240px}.entry-list,.example-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:24px}.entry-row{display:grid;grid-template-columns:108px minmax(0,1.35fr) minmax(0,1fr) 28px;align-items:center;gap:8px;min-height:46px;padding:7px 2px;border-top:1px solid var(--sr-border)}.entry-row strong,.regex-example strong{font-size:13px}.entry-row code,.regex-example code{color:var(--sr-blue);font-size:12px;line-height:1.4;overflow-wrap:anywhere}.entry-row>span,.regex-example>span{color:var(--sr-text-muted);font-size:12px;line-height:1.4}.entry-row .el-button,.regex-example .el-button{height:28px;width:28px}.regex-examples{margin-top:18px;border-top:1px solid var(--sr-border);padding-top:12px}.regex-examples h3{margin:0 0 4px;font-size:15px}.regex-example{display:grid;grid-template-columns:88px minmax(0,1fr) 28px;align-items:center;gap:8px;min-height:52px;padding:8px 2px;border-top:1px solid var(--sr-border)}.regex-example>span{grid-column:1/4}.regex-example>span b{color:var(--sr-text)}@media(max-width:900px){.entry-list,.example-grid{grid-template-columns:1fr}}@media(max-width:720px){.sheet-panel{padding:12px}.sheet-heading{align-items:flex-start;flex-direction:column;gap:8px}.sheet-heading .el-input{width:100%}.entry-row{grid-template-columns:82px 1fr 28px}.entry-row>span{grid-column:1/3;grid-row:2;padding-bottom:2px}}
</style>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { BookOpenCheck, Copy, Search } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { cheatsheets } from '../cheatsheetData'

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
      <el-empty v-if="!entries.length" description="没有匹配的条目" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.sheet-page{max-width:1100px;margin:0 auto}.sheet-tabs{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}.sheet-tabs .active{border-color:var(--sr-blue);background:var(--sr-blue-soft);color:var(--sr-blue)}.sheet-panel{padding:22px}.sheet-heading{display:flex;align-items:center;justify-content:space-between;gap:20px;margin-bottom:16px}.sheet-heading>div{display:flex;align-items:baseline;gap:10px}.sheet-heading h2{margin:0;font-size:18px}.sheet-heading span{color:var(--sr-text-muted);font-size:12px}.sheet-heading .el-input{width:280px}.entry-row{display:grid;grid-template-columns:140px minmax(190px,1fr) minmax(180px,1fr) 36px;align-items:center;gap:14px;min-height:54px;padding:9px 6px;border-top:1px solid var(--sr-border)}.entry-row strong{font-size:13px}.entry-row code{color:var(--sr-blue);font-size:12px;word-break:break-word}.entry-row>span{color:var(--sr-text-muted);font-size:12px}@media(max-width:720px){.sheet-panel{padding:16px}.sheet-heading{align-items:flex-start;flex-direction:column}.sheet-heading .el-input{width:100%}.entry-row{grid-template-columns:90px 1fr 36px}.entry-row>span{grid-column:1/3}}
</style>

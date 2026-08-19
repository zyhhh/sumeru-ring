<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules, type UploadFile } from 'element-plus'
import { ArrowDown, ArrowLeft, ArrowUp, Download, Plus, RefreshCw, Upload } from 'lucide-vue-next'
import ToolDocumentation from '@/components/tool/ToolDocumentation.vue'
import ToolPageHeader from '@/components/tool/ToolPageHeader.vue'
import { deleteLink, importLinks, initializeLinks, listLinks, replaceOrder, restoreDefaultLinks, saveLink } from '../linkRepository'
import { LINK_CATEGORIES, type LinkCategory, type LinkDraft, type LinkItem } from '../types'

const links = ref<LinkItem[]>([])
const loading = ref(false)
const query = ref('')
const category = ref<'全部' | LinkCategory>('全部')
const dialogVisible = ref(false)
const editing = ref<LinkItem>()
const formRef = ref<FormInstance>()
const form = reactive<LinkDraft>({ title: '', url: '', category: '工具', tags: [], description: '' })
const rules: FormRules<LinkDraft> = {
  title: [{ required: true, message: '请输入网址名称', trigger: 'blur' }],
  url: [{ required: true, message: '请输入网址', trigger: 'blur' }],
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
}

const filteredLinks = computed(() => {
  const normalized = query.value.trim().toLocaleLowerCase()
  return links.value.filter((item) => {
    const categoryMatched = category.value === '全部' || item.category === category.value
    const textMatched = !normalized || [item.title, item.url, item.description, item.category, ...item.tags].join(' ').toLocaleLowerCase().includes(normalized)
    return categoryMatched && textMatched
  })
})

async function reload() {
  loading.value = true
  try { links.value = await listLinks() } finally { loading.value = false }
}

function openCreate() {
  editing.value = undefined
  Object.assign(form, { title: '', url: '', category: '工具', tags: [], description: '' })
  dialogVisible.value = true
}

function openEdit(item: LinkItem) {
  editing.value = item
  Object.assign(form, { title: item.title, url: item.url, category: item.category, tags: [...item.tags], description: item.description })
  dialogVisible.value = true
}

async function submit() {
  await formRef.value?.validate()
  try {
    await saveLink({ ...form, tags: form.tags.map((tag) => tag.trim()).filter(Boolean) }, editing.value)
    dialogVisible.value = false
    ElMessage.success(editing.value ? '网址已更新' : '网址已添加')
    await reload()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  }
}

async function remove(item: LinkItem) {
  await ElMessageBox.confirm(`确定删除“${item.title}”吗？`, '删除网址', { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' })
  await deleteLink(item.id)
  ElMessage.success('网址已删除')
  await reload()
}

async function move(item: LinkItem, offset: -1 | 1) {
  const index = links.value.findIndex((link) => link.id === item.id)
  const target = index + offset
  if (index < 0 || target < 0 || target >= links.value.length) return
  const ordered = [...links.value]
  const currentItem = ordered[index]
  const targetItem = ordered[target]
  if (!currentItem || !targetItem) return
  ordered[index] = targetItem
  ordered[target] = currentItem
  await replaceOrder(ordered)
  await reload()
}

function exportJson() {
  const blob = new Blob([JSON.stringify(links.value, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `sumeru-ring-links-${new Date().toISOString().slice(0, 10)}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

async function importJson(uploadFile: UploadFile) {
  if (!uploadFile.raw) return
  try {
    const data = JSON.parse(await uploadFile.raw.text())
    if (!Array.isArray(data)) throw new Error('导入文件必须是网址数组')
    await importLinks(data as LinkItem[])
    ElMessage.success(`成功导入 ${data.length} 条网址`)
    await reload()
  } catch (error) {
    ElMessage.error(error instanceof SyntaxError ? '导入失败：文件内容不是有效的网址数据' : error instanceof Error ? error.message : '导入失败')
  }
}

async function restoreDefaults() {
  await ElMessageBox.confirm('恢复默认网址会覆盖同 ID 的默认记录，但不会删除你新增的网址。是否继续？', '恢复默认网址', { type: 'warning', confirmButtonText: '恢复', cancelButtonText: '取消' })
  await restoreDefaultLinks()
  ElMessage.success('默认网址已恢复')
  await reload()
}

onMounted(async () => { await initializeLinks(); await reload() })
const docs = [
  { title: '数据保存位置', content: '网址保存在当前浏览器 IndexedDB 中，不会上传服务器。清理站点数据后本地网址会丢失。' },
  { title: '备份与迁移', content: '使用导出 JSON 创建备份，在其他浏览器或设备中使用导入 JSON 恢复。导入采用新增或更新，不删除现有数据。' },
  { title: '网址安全', content: '只允许 http 和 https 地址。打开外部网址时使用新标签页并隔离 opener，降低第三方页面影响当前工作台的风险。' },
]
</script>

<template>
  <div class="sr-page link-manager">
    <ToolPageHeader category="网址导航" title="网址管理" description="维护常用网址、分类、标签和展示顺序，数据保存在当前浏览器。" :tags="['IndexedDB', '网址导航']" />
    <div class="manager-back"><RouterLink to="/links"><el-button><ArrowLeft :size="16" />返回网址导航</el-button></RouterLink></div>
    <section class="manager-panel sr-panel">
      <div class="toolbar">
        <el-input v-model="query" clearable placeholder="搜索名称、网址、分类或标签" />
        <el-select v-model="category"><el-option label="全部分类" value="全部" /><el-option v-for="item in LINK_CATEGORIES" :key="item" :label="item" :value="item" /></el-select>
        <el-button class="sr-primary-button" type="primary" @click="openCreate"><Plus :size="16" />新增网址</el-button>
        <el-upload :auto-upload="false" :show-file-list="false" accept="application/json,.json" :on-change="importJson"><el-button><Upload :size="16" />导入</el-button></el-upload>
        <el-button @click="exportJson"><Download :size="16" />导出</el-button>
        <el-button class="sr-secondary-button" @click="restoreDefaults"><RefreshCw :size="16" />恢复默认</el-button>
      </div>

      <el-table v-loading="loading" :data="filteredLinks" row-key="id" empty-text="没有符合条件的网址">
        <el-table-column label="名称" min-width="170"><template #default="{ row }"><a class="link-title" :href="row.url" target="_blank" rel="noopener noreferrer">{{ row.title }}</a><small>{{ row.url }}</small></template></el-table-column>
        <el-table-column prop="category" label="分类" width="100"><template #default="{ row }"><el-tag effect="light">{{ row.category }}</el-tag></template></el-table-column>
        <el-table-column label="标签" min-width="150"><template #default="{ row }"><el-tag v-for="tag in row.tags" :key="tag" class="item-tag" type="warning" effect="light">{{ tag }}</el-tag></template></el-table-column>
        <el-table-column prop="description" label="简介" min-width="180" show-overflow-tooltip />
        <el-table-column label="操作" width="260" fixed="right"><template #default="{ row }"><el-button text circle title="上移" @click="move(row, -1)"><ArrowUp :size="16" /></el-button><el-button text circle title="下移" @click="move(row, 1)"><ArrowDown :size="16" /></el-button><el-button text @click="openEdit(row)">编辑</el-button><el-button text type="danger" @click="remove(row)">删除</el-button></template></el-table-column>
      </el-table>
    </section>

    <el-dialog v-model="dialogVisible" :title="editing ? '编辑网址' : '新增网址'" width="min(520px, 92vw)" destroy-on-close>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="名称" prop="title"><el-input v-model="form.title" placeholder="例如：JWT.io" /></el-form-item><el-form-item label="网址" prop="url"><el-input v-model="form.url" placeholder="example.com 或 https://example.com" /></el-form-item><el-form-item label="分类" prop="category"><el-select v-model="form.category" class="full-width"><el-option v-for="item in LINK_CATEGORIES" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="标签"><el-select v-model="form.tags" multiple filterable allow-create default-first-option class="full-width" placeholder="输入标签后按回车" /></el-form-item><el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="3" placeholder="简要说明网站用途" /></el-form-item></el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button class="sr-primary-button" type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
    <ToolDocumentation :sections="docs" />
  </div>
</template>

<style scoped lang="scss">
.link-manager{max-width:1440px;margin:0 auto}.manager-back{display:flex;justify-content:flex-end;margin:-62px 0 24px}.manager-panel{padding:20px}.toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 150px repeat(4,auto);gap:8px;margin-bottom:18px}.link-title{display:block;color:var(--sr-blue);font-weight:600}.link-title+small{display:block;margin-top:4px;color:var(--sr-text-muted);font-size:11px}.item-tag{margin:2px 5px 2px 0}.full-width{width:100%}
@media(max-width:1100px){.toolbar{grid-template-columns:1fr 150px repeat(2,auto)}.toolbar>*:nth-child(n+5){grid-row:2}}@media(max-width:720px){.manager-back{justify-content:flex-start;margin:-10px 0 18px}.toolbar{display:flex;flex-wrap:wrap}.toolbar>.el-input{width:100%}.toolbar>.el-select{width:150px}}
</style>

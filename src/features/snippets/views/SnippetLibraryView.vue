<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { Copy, FileCode2, Pencil, Plus, Trash2 } from 'lucide-vue-next'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { deleteSnippet, listSnippets, saveSnippet, SNIPPET_LANGUAGES, type Snippet, type SnippetDraft, type SnippetLanguage } from '../snippetRepository'

const items = ref<Snippet[]>([])
const query = ref('')
const language = ref<'全部' | SnippetLanguage>('全部')
const dialogVisible = ref(false)
const editing = ref<Snippet>()
const formRef = ref<FormInstance>()
const form = reactive<SnippetDraft>({ title: '', language: 'SQL', code: '', description: '' })
const rules: FormRules<SnippetDraft> = { title: [{ required: true, message: '请输入名称', trigger: 'blur' }], code: [{ required: true, message: '请输入代码', trigger: 'blur' }] }
const filtered = computed(() => {
  const text = query.value.trim().toLocaleLowerCase()
  return items.value.filter((item) => (language.value === '全部' || item.language === language.value) && (!text || [item.title, item.description, item.code].join(' ').toLocaleLowerCase().includes(text)))
})
function reload() { items.value = listSnippets() }
function openCreate() { editing.value = undefined; Object.assign(form, { title: '', language: 'SQL', code: '', description: '' }); dialogVisible.value = true }
function openEdit(item: Snippet) { editing.value = item; Object.assign(form, item); dialogVisible.value = true }
async function submit() { await formRef.value?.validate(); saveSnippet({ ...form }, editing.value); dialogVisible.value = false; reload(); ElMessage.success(editing.value ? '片段已更新' : '片段已保存') }
async function remove(item: Snippet) { await ElMessageBox.confirm(`确定删除“${item.title}”吗？`, '删除代码片段', { confirmButtonText: '删除', cancelButtonText: '取消', type: 'warning' }); deleteSnippet(item.id); reload() }
async function copy(code: string) { await navigator.clipboard.writeText(code); ElMessage.success('代码已复制') }
onMounted(reload)
</script>

<template>
  <div class="sr-page snippet-page">
    <header class="list-heading"><div><p>常用代码</p><h1>代码片段</h1><span>保存常用配置与代码，数据仅存于当前浏览器。</span></div><strong>{{ filtered.length }} 项</strong></header>
    <div class="snippet-toolbar"><el-input v-model="query" clearable placeholder="搜索名称、说明或代码" /><el-select v-model="language"><el-option label="全部类型" value="全部" /><el-option v-for="item in SNIPPET_LANGUAGES" :key="item" :label="item" :value="item" /></el-select><el-button class="sr-primary-button" type="primary" @click="openCreate"><Plus :size="16" />新增片段</el-button></div>
    <div class="snippet-grid">
      <article v-for="item in filtered" :key="item.id" class="snippet-card sr-panel">
        <header><div><span>{{ item.language }}</span><h2>{{ item.title }}</h2></div><div><el-button text circle title="复制" @click="copy(item.code)"><Copy :size="16" /></el-button><el-button text circle title="编辑" @click="openEdit(item)"><Pencil :size="16" /></el-button><el-button text circle title="删除" @click="remove(item)"><Trash2 :size="16" /></el-button></div></header>
        <p v-if="item.description">{{ item.description }}</p><pre><code>{{ item.code }}</code></pre>
      </article>
    </div>
    <el-empty v-if="!filtered.length" description="暂无代码片段"><el-button class="sr-primary-button" @click="openCreate"><FileCode2 :size="16" />创建第一个片段</el-button></el-empty>
    <el-dialog v-model="dialogVisible" :title="editing ? '编辑代码片段' : '新增代码片段'" width="min(680px, 92vw)">
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top"><el-form-item label="名称" prop="title"><el-input v-model="form.title" placeholder="例如：查询慢 SQL" /></el-form-item><el-form-item label="类型"><el-select v-model="form.language"><el-option v-for="item in SNIPPET_LANGUAGES" :key="item" :label="item" :value="item" /></el-select></el-form-item><el-form-item label="说明"><el-input v-model="form.description" placeholder="可选" /></el-form-item><el-form-item label="代码" prop="code"><el-input v-model="form.code" type="textarea" :rows="12" placeholder="粘贴代码或配置" /></el-form-item></el-form>
      <template #footer><el-button @click="dialogVisible = false">取消</el-button><el-button class="sr-primary-button" type="primary" @click="submit">保存</el-button></template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.snippet-page{max-width:1280px;margin:0 auto}.snippet-toolbar{display:grid;grid-template-columns:minmax(220px,1fr) 150px auto;gap:8px;margin-bottom:20px}.snippet-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.snippet-card{min-width:0;padding:18px}.snippet-card header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.snippet-card header>div:last-child{display:flex}.snippet-card span{color:var(--sr-orange);font-size:11px;font-weight:600}.snippet-card h2{margin:3px 0 0;font-size:16px}.snippet-card p{margin:10px 0;color:var(--sr-text-muted);font-size:12px}.snippet-card pre{max-height:260px;margin:14px 0 0;padding:14px;border-radius:5px;background:var(--sr-surface-soft);overflow:auto;font-size:12px;white-space:pre-wrap}.el-select{width:100%}@media(max-width:720px){.snippet-toolbar{grid-template-columns:1fr 130px}.snippet-toolbar .el-button{grid-column:1/-1}.snippet-grid{grid-template-columns:1fr}}
</style>

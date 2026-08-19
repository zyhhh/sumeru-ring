<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { BookOpenCheck, FileCode2, PanelLeftClose, PanelLeftOpen, Search, X, Sun, Moon, LayoutGrid, Wrench, Star, History, ExternalLink, TerminalSquare } from 'lucide-vue-next'
import { contentRegistry } from '@/registry/contentRegistry'
import { searchUnifiedContent } from '@/registry/contentCatalog'
import { usePreferencesStore } from '@/stores/preferences'
import { initializeLinks, listLinks } from '@/features/links/linkRepository'
import type { LinkItem } from '@/features/links/types'

const router = useRouter()
const route = useRoute()
const preferences = usePreferencesStore()
const search = ref('')
const searchOpen = ref(false)
const searchInput = ref<HTMLInputElement>()
const links = ref<LinkItem[]>([])
const results = ref<{ id: string; title: string; description: string; target: string; external: boolean; type: string }[]>([])
const toolCount = contentRegistry.filter((item) => item.type === 'tool').length
const typeLabels: Record<string, string> = { tool: '内置工具', link: '网址', 'command-template': '命令模板', snippet: '代码片段', cheatsheet: '速查表' }
const activeNavigation = computed(() => route.meta.navigation)

function openResult(target: string, external: boolean) {
  search.value = ''
  searchOpen.value = false
  if (external) window.open(target, '_blank', 'noopener,noreferrer')
  else router.push(target)
}

async function openSearch() {
  searchOpen.value = true
  await nextTick()
  searchInput.value?.focus()
}

function closeSearch() {
  search.value = ''
  searchOpen.value = false
}

let searchRequest = 0
watch(search, async (value) => {
  if (!value.trim()) { results.value = []; return }
  const request = ++searchRequest
  const items = await searchUnifiedContent({ query: value, limit: 8 })
  if (request !== searchRequest) return
  results.value = items.map((item) => ({ id: item.id, title: item.title, description: `${typeLabels[item.type]} · ${item.description}`, target: item.target, external: item.external, type: item.type }))
})

onMounted(async () => {
  await initializeLinks()
  links.value = await listLinks()
})
</script>

<template>
  <div class="app-shell" :class="{ collapsed: preferences.sidebarCollapsed }">
    <header class="app-header">
      <RouterLink class="brand" to="/"><strong><span>SUMERU</span> <em>RING</em></strong><small>个人实用工具工作台</small></RouterLink>
      <div class="header-actions">
      <div class="global-search" :class="{ open: searchOpen }">
        <el-button v-if="!searchOpen" class="icon-button search-trigger" circle title="搜索" aria-label="打开搜索" @click="openSearch"><Search :size="19" /></el-button>
        <template v-else>
          <Search class="search-leading" :size="17" />
          <input ref="searchInput" v-model="search" placeholder="搜索工具、标签或网址…" aria-label="全局搜索" @keydown.esc="closeSearch" />
          <el-button class="search-close" text circle title="关闭搜索" aria-label="关闭搜索" @click="closeSearch"><X :size="17" /></el-button>
        </template>
        <div v-if="results.length" class="search-results">
          <el-button v-for="item in results" :key="item.id" text @click="openResult(item.target, item.external)"><span class="result-content"><strong>{{ item.title }}</strong><span>{{ item.description }}</span></span></el-button>
        </div>
      </div>
      <el-button class="icon-button" circle title="切换明暗主题" @click="preferences.darkMode = !preferences.darkMode"><Moon v-if="!preferences.darkMode" :size="18" /><Sun v-else :size="18" /></el-button>
      </div>
    </header>

    <aside class="app-sidebar">
      <el-button class="collapse-button" text :title="preferences.sidebarCollapsed ? '展开侧栏' : '收起侧栏'" @click="preferences.sidebarCollapsed = !preferences.sidebarCollapsed">
        <PanelLeftOpen v-if="preferences.sidebarCollapsed" :size="18" /><PanelLeftClose v-else :size="18" /><span style="margin-left: 10px">收起导航</span>
      </el-button>
      <nav>
        <RouterLink to="/" :class="{ 'is-active': activeNavigation === 'home' }"><LayoutGrid :size="17" /><span>全部内容</span></RouterLink>
        <a class="disabled"><Star :size="17" /><span>我的收藏</span></a>
        <a class="disabled"><History :size="17" /><span>最近使用</span></a>
        <div class="nav-label">内容类型</div>
        <RouterLink to="/tools" :class="{ 'is-active': activeNavigation === 'tools' }"><Wrench :size="17" /><span>小工具</span><small>{{ toolCount }}</small></RouterLink>
        <RouterLink to="/links" :class="{ 'is-active': activeNavigation === 'links' }"><ExternalLink :size="17" /><span>网址导航</span><small>{{ links.length }}</small></RouterLink>
        <RouterLink to="/commands" :class="{ 'is-active': activeNavigation === 'commands' }"><TerminalSquare :size="17" /><span>命令模板</span><small>4</small></RouterLink>
        <RouterLink to="/snippets" :class="{ 'is-active': activeNavigation === 'snippets' }"><FileCode2 :size="17" /><span>代码片段</span></RouterLink>
        <RouterLink to="/cheatsheets" :class="{ 'is-active': activeNavigation === 'cheatsheets' }"><BookOpenCheck :size="17" /><span>速查表</span><small>4</small></RouterLink>
      </nav>
    </aside>

    <main class="app-content"><RouterView /></main>
  </div>
</template>

<style scoped lang="scss">
.app-shell { min-height:100vh; display:grid; grid-template-columns:var(--sr-sidebar-width) minmax(0,1fr); grid-template-rows:64px minmax(0,1fr); transition:grid-template-columns .2s ease; }
.app-shell.collapsed { --sr-sidebar-width:58px; }
.app-header { position:sticky; z-index:20; top:0; grid-column:1/-1; display:flex; align-items:center; gap:28px; padding:0 22px; border-bottom:1px solid var(--sr-border); background:var(--sr-surface); }
.brand { width:190px; white-space:nowrap; } .brand strong{display:block;font-size:16px;font-weight:600}.brand span{color:var(--sr-blue)}.brand em{color:var(--sr-orange);font-style:normal}.brand small{display:block;margin-top:2px;color:var(--sr-text-muted);font-size:11px;letter-spacing:.06em}
.header-actions{display:flex;align-items:center;gap:8px;margin-left:auto}.global-search{position:relative;display:flex;align-items:center;width:38px;height:38px;border:1px solid transparent;border-radius:19px;background:transparent;color:var(--sr-text-muted);transition:width .22s ease,border-color .15s ease,background-color .15s ease}.global-search.open{width:min(420px,42vw);padding:0 9px 0 12px;border-color:var(--sr-border);background:var(--sr-surface-soft)}
.global-search input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:var(--sr-text);font-size:13px}.search-leading{flex:none;color:var(--sr-blue)}.search-close{display:grid;place-items:center;width:28px;height:28px;padding:0;border:0;border-radius:50%;background:transparent;color:var(--sr-text-muted);cursor:pointer}.search-close:hover{background:var(--sr-orange-soft);color:var(--sr-orange)}
.search-results{position:absolute;top:46px;right:0;width:100%;min-width:300px;padding:7px;border:1px solid var(--sr-border);border-radius:10px;background:var(--sr-surface);box-shadow:0 14px 32px rgba(24,46,32,.12)}.search-results .el-button{display:flex;width:100%;height:auto;min-height:58px;margin:0;justify-content:flex-start;padding:10px 12px;text-align:left}.result-content,.result-content strong,.result-content span{display:block}.result-content strong{font-size:13px}.result-content span{margin-top:4px;color:var(--sr-text-muted);font-size:12px}
.icon-button.el-button{display:grid;width:38px;height:38px;min-height:38px;padding:0;border-color:transparent;background:transparent;color:var(--sr-text-muted)}.icon-button.el-button:hover{transform:none;border-color:var(--sr-border);background:var(--sr-blue-soft);color:var(--sr-blue)}
.app-sidebar{position:sticky;top:64px;height:calc(100vh - 64px);padding:14px 10px;border-right:1px solid var(--sr-border);background:var(--sr-surface);overflow:hidden}.collapse-button.el-button,nav a{display:flex;align-items:center;justify-content:flex-start;gap:10px;width:100%;height:38px;padding:0 10px;border:0;border-radius:7px;background:transparent;color:var(--sr-text-muted);white-space:nowrap}.collapse-button.el-button{margin:0 0 12px}.collapse-button.el-button:hover{transform:none;background:var(--sr-orange-soft);color:var(--sr-orange)}.collapse-button span{font-size:13px}nav a{margin-bottom:3px;font-size:13px}nav a.is-active{background:var(--sr-blue-soft);color:var(--sr-blue)}nav a.disabled{opacity:.55;cursor:not-allowed}nav small{margin-left:auto;font-size:12px}.nav-label{margin:18px 10px 7px;color:var(--sr-text-muted);font-size:12px;text-transform:uppercase}
.collapsed .app-sidebar{padding-inline:8px}.collapsed .collapse-button,.collapsed nav a{justify-content:center;padding:0}.collapsed .collapse-button span,.collapsed nav span,.collapsed nav small,.collapsed .nav-label{display:none}
.app-content{min-width:0}
@media(max-width:720px){.app-shell,.app-shell.collapsed{grid-template-columns:1fr}.app-header{padding:0 14px;gap:10px}.brand{width:auto}.brand small{display:none}.global-search.open{position:absolute;right:56px;width:calc(100vw - 126px);background:var(--sr-surface)}.app-sidebar{display:none}}
</style>

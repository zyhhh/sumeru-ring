import { createRouter, createWebHistory } from 'vue-router'
import { getToolRouteRecords } from '@/registry/contentCatalog'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { navigation: 'home' } },
    { path: '/tools', name: 'tools', component: () => import('@/views/ToolListView.vue'), meta: { navigation: 'tools' } },
    ...getToolRouteRecords(),
    { path: '/commands', name: 'command-templates', component: () => import('@/features/commands/views/CommandTemplatesView.vue'), meta: { navigation: 'commands' } },
    { path: '/snippets', name: 'snippets', component: () => import('@/features/snippets/views/SnippetLibraryView.vue'), meta: { navigation: 'snippets' } },
    { path: '/cheatsheets', name: 'cheatsheets', component: () => import('@/features/cheatsheets/views/CheatsheetView.vue'), meta: { navigation: 'cheatsheets' } },
    { path: '/links', name: 'links', component: () => import('@/features/links/views/LinkNavigationView.vue'), meta: { navigation: 'links' } },
    { path: '/links/manage', name: 'link-manager', component: () => import('@/features/links/views/LinkManagerView.vue'), meta: { navigation: 'links' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router

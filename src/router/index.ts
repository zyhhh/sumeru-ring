import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: () => import('@/views/HomeView.vue'), meta: { navigation: 'home' } },
    { path: '/tools', name: 'tools', component: () => import('@/views/ToolListView.vue'), meta: { navigation: 'tools' } },
    { path: '/tools/jwt', name: 'tool-jwt', component: () => import('@/features/jwt/views/JwtToolView.vue'), meta: { navigation: 'tools' } },
    { path: '/tools/qr-code', name: 'tool-qr-code', component: () => import('@/features/qr-code/views/QrCodeToolView.vue'), meta: { navigation: 'tools' } },
    { path: '/tools/json', name: 'tool-json', component: () => import('@/features/json/views/JsonToolView.vue'), meta: { navigation: 'tools' } },
    { path: '/tools/url-codec', name: 'tool-url-codec', component: () => import('@/features/url-codec/views/UrlCodecToolView.vue'), meta: { navigation: 'tools' } },
    { path: '/tools/character-count', name: 'tool-character-count', component: () => import('@/features/character-count/views/CharacterCountToolView.vue'), meta: { navigation: 'tools' } },
    { path: '/links', name: 'links', component: () => import('@/features/links/views/LinkNavigationView.vue'), meta: { navigation: 'links' } },
    { path: '/links/manage', name: 'link-manager', component: () => import('@/features/links/views/LinkManagerView.vue'), meta: { navigation: 'links' } },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
  scrollBehavior: () => ({ top: 0 }),
})

export default router

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import LinkCard from '@/components/content/LinkCard.vue'
import ToolCard from '@/components/content/ToolCard.vue'
import ViewMoreCard from '@/components/content/ViewMoreCard.vue'
import { initializeLinks, listLinks } from '@/features/links/linkRepository'
import type { LinkItem } from '@/features/links/types'
import { contentRegistry } from '@/registry/contentRegistry'
import { builtinContentTypes } from '@/registry/contentCatalog'

const PREVIEW_LIMIT = 5
const tools = contentRegistry.filter((item) => item.type === 'tool')
const links = ref<LinkItem[]>([])
const previewTools = tools.slice(0, PREVIEW_LIMIT)
const previewLinks = computed(() => links.value.slice(0, PREVIEW_LIMIT))

onMounted(async () => {
  try {
    await initializeLinks()
    links.value = await listLinks()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '网址加载失败')
  }
})
</script>

<template>
  <div class="sr-page home-page">
    <section class="home-heading">
      <div><p>须弥之戒</p><h1>我的工作台</h1><span>工具与资源集中管理，所有计算均在当前浏览器内完成。</span></div>
      <!--<div class="accent-ring"></div>-->
    </section>

    <section class="preview-section">
      <div class="section-title"><h2>开发资料</h2><span>{{ builtinContentTypes.length }} TYPES</span></div>
      <div class="content-grid"><ToolCard v-for="item in builtinContentTypes" :key="item.id" :item="item" /></div>
    </section>

    <section class="preview-section">
      <div class="section-title"><h2>小工具</h2><span>{{ tools.length }} ITEMS</span></div>
      <div class="content-grid">
        <ToolCard v-for="item in previewTools" :key="item.id" :item="item" />
        <ViewMoreCard v-if="tools.length > PREVIEW_LIMIT" to="/tools" title="小工具" :total="tools.length" />
      </div>
    </section>

    <section class="preview-section">
      <div class="section-title"><h2>网址导航</h2><span>{{ links.length }} LINKS</span></div>
      <div class="content-grid">
        <LinkCard v-for="item in previewLinks" :key="item.id" :item="item" />
        <ViewMoreCard v-if="links.length > PREVIEW_LIMIT" to="/links" title="网址" :total="links.length" />
      </div>
      <el-empty v-if="!links.length" description="暂无网址" />
    </section>
  </div>
</template>

<style scoped lang="scss">
.home-page{max-width:1280px;margin:0 auto}.home-heading{display:flex;align-items:center;justify-content:space-between;margin-bottom:30px}.home-heading p{margin:0 0 8px;color:var(--sr-orange);font-size:12px;font-weight:600}.home-heading h1{margin:0 0 8px;font-size:30px;font-weight:600;letter-spacing:0}.home-heading span{color:var(--sr-text-muted);font-size:14px}.accent-ring{width:68px;height:68px;border:10px solid var(--sr-blue);border-right-color:var(--sr-orange);border-radius:50%}.preview-section+.preview-section{margin-top:36px}.section-title{display:flex;align-items:baseline;gap:10px;margin-bottom:14px}.section-title h2{margin:0;font-size:18px;font-weight:600}.section-title span{color:var(--sr-text-muted);font-size:12px}
@media(max-width:520px){.accent-ring{display:none}}
</style>

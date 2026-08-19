<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Settings } from 'lucide-vue-next'
import LinkCard from '@/components/content/LinkCard.vue'
import { initializeLinks, listLinks } from '../linkRepository'
import type { LinkCategory, LinkItem } from '../types'

const PAGE_SIZE = 16
const links = ref<LinkItem[]>([])
const loading = ref(false)
const category = ref<'全部' | LinkCategory>('全部')
const currentPage = ref(1)
const categories = computed(() => ['全部', ...new Set(links.value.map((item) => item.category))])
const filteredLinks = computed(() => category.value === '全部' ? links.value : links.value.filter((item) => item.category === category.value))
const pagedLinks = computed(() => filteredLinks.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))

watch(category, () => { currentPage.value = 1 })

onMounted(async () => {
  loading.value = true
  try {
    await initializeLinks()
    links.value = await listLinks()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '网址加载失败')
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div v-loading="loading" class="sr-page content-list-page">
    <section class="list-heading">
      <div><p>常用网址</p><h1>网址导航</h1><span>集中浏览常用站点，网址数据仅保存在当前浏览器。</span></div>
      <RouterLink to="/links/manage"><el-button class="sr-primary-button" type="primary"><Settings :size="16" />管理网址</el-button></RouterLink>
    </section>
    <div class="content-filter" aria-label="按分类筛选">
      <el-check-tag v-for="item in categories" :key="item" :checked="category === item" @change="category = item as typeof category">{{ item }}</el-check-tag>
    </div>
    <div class="content-grid"><LinkCard v-for="item in pagedLinks" :key="item.id" :item="item" /></div>
    <el-empty v-if="!loading && !filteredLinks.length" description="暂无网址" />
    <el-pagination v-if="filteredLinks.length > PAGE_SIZE" v-model:current-page="currentPage" class="content-pagination" background layout="prev, pager, next" :page-size="PAGE_SIZE" :total="filteredLinks.length" />
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import ToolCard from '@/components/content/ToolCard.vue'
import { contentRegistry } from '@/registry/contentRegistry'

const PAGE_SIZE = 16
const activeTag = ref('全部')
const currentPage = ref(1)
const tools = contentRegistry.filter((item) => item.type === 'tool')
const tags = ['全部', ...new Set(tools.flatMap((item) => item.tags))]
const filteredTools = computed(() => activeTag.value === '全部' ? tools : tools.filter((item) => item.tags.includes(activeTag.value)))
const pagedTools = computed(() => filteredTools.value.slice((currentPage.value - 1) * PAGE_SIZE, currentPage.value * PAGE_SIZE))

// 筛选条件改变后回到第一页，避免停留在已经不存在的页码。
watch(activeTag, () => { currentPage.value = 1 })
</script>

<template>
  <div class="sr-page content-list-page">
    <section class="list-heading">
      <div><p>TOOLS</p><h1>小工具</h1><span>所有计算均在当前浏览器内完成，不会上传你的输入内容。</span></div>
      <strong>{{ filteredTools.length }} ITEMS</strong>
    </section>
    <div class="content-filter" aria-label="按标签筛选">
      <el-check-tag v-for="tag in tags" :key="tag" :checked="activeTag === tag" @change="activeTag = tag">{{ tag }}</el-check-tag>
    </div>
    <div class="content-grid"><ToolCard v-for="item in pagedTools" :key="item.id" :item="item" /></div>
    <el-empty v-if="!filteredTools.length" description="没有符合条件的小工具" />
    <el-pagination v-if="filteredTools.length > PAGE_SIZE" v-model:current-page="currentPage" class="content-pagination" background layout="prev, pager, next" :page-size="PAGE_SIZE" :total="filteredTools.length" />
  </div>
</template>


<script setup lang="ts">
import { ArrowRight } from 'lucide-vue-next'

defineProps<{ to: string; title: string; total: number }>()
</script>

<template>
  <RouterLink :to="to" class="content-card more-card sr-panel">
    <div class="more-card__content">
      <span>{{ total }} ITEMS</span><h3>查看更多{{ title }}</h3><p>进入完整列表浏览、筛选全部内容。</p>
    </div>
    <div class="more-card__arrow"><ArrowRight :size="22" /></div>
  </RouterLink>
</template>


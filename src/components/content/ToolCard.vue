<script setup lang="ts">
import { Braces, KeyRound, Link, QrCode, TextCursorInput, Wrench } from 'lucide-vue-next'
import type { ContentItem } from '@/types/content'

defineProps<{ item: ContentItem }>()

// 显式维护图标映射，避免打包整个图标库；新增工具图标时在此补充。
const iconMap = { Braces, KeyRound, Link, QrCode, TextCursorInput, Wrench }
function iconFor(name: string) {
  return iconMap[name as keyof typeof iconMap] ?? Wrench
}
</script>

<template>
  <RouterLink :to="item.route" class="content-card sr-panel">
    <div class="content-card__icon"><component :is="iconFor(item.icon)" :size="21" /></div>
    <div><h3>{{ item.title }}</h3><p>{{ item.description }}</p></div>
    <div class="content-card__tags">
      <span v-for="(tag, index) in item.tags" :key="tag" :class="{ orange: index === 1 }">{{ tag }}</span>
    </div>
  </RouterLink>
</template>


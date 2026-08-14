<script setup lang="ts">
import { ExternalLink } from 'lucide-vue-next'
import type { LinkItem } from '@/features/links/types'

defineProps<{ item: LinkItem }>()

function hostnameOf(url: string) {
  try { return new URL(url).hostname } catch { return url }
}
</script>

<template>
  <a :href="item.url" target="_blank" rel="noopener noreferrer" class="content-card sr-panel">
    <div class="content-card__icon content-card__icon--orange"><ExternalLink :size="21" /></div>
    <div><h3>{{ item.title }}</h3><p>{{ item.description }}</p><small>{{ hostnameOf(item.url) }}</small></div>
    <div class="content-card__tags">
      <span>{{ item.category }}</span><span v-for="tag in item.tags.slice(0, 2)" :key="tag" class="orange">{{ tag }}</span>
    </div>
  </a>
</template>


<script setup lang="ts">
defineProps<{ category: string; title: string; description: string; tags: string[] }>()
</script>
<template><header class="tool-header"><div class="breadcrumb">小工具 / {{ category }} / <span>{{ title }}</span></div><h1>{{ title }}</h1><p>{{ description }}</p><div class="header-tags"><span v-for="tag in tags" :key="tag">{{ tag }}</span></div></header></template>
<style scoped lang="scss">.tool-header{margin-bottom:24px}.breadcrumb{margin-bottom:14px;color:var(--sr-text-muted);font-size:12px}.breadcrumb span{color:var(--sr-orange)}h1{margin:0 0 8px;font-size:26px;font-weight:600;letter-spacing:0}p{margin:0;color:var(--sr-text-muted);font-size:14px}.header-tags{display:flex;gap:7px;margin-top:14px}.header-tags span{padding:5px 9px;border-radius:999px;background:var(--sr-blue-soft);color:var(--sr-blue);font-size:12px;font-weight:600}</style>

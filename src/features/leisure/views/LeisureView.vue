<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Coffee, Heart, MessageCircle, Send, Shuffle, Sparkles, Trash2 } from 'lucide-vue-next'
import { leisureCategories, leisureItems } from '../leisureData'

const lastIndex = ref(-1)
const recommendation = computed(() => lastIndex.value < 0 ? undefined : leisureItems[lastIndex.value])
function open(url: string) { window.open(url, '_blank', 'noopener,noreferrer') }
const moods = ['摸鱼中', '今天不错', '有点累', '灵感来了']
const prompts = ['最近有什么让你开心的小事？', '今天最想把什么事情暂时放下？', '分享一个最近发现的好东西吧。', '如果现在放假，你最想去哪里？']
const mood = ref(moods[0] ?? '')
const message = ref('')
const prompt = ref(prompts[0] ?? '')
const messages = ref<{ id: string; mood: string; content: string; createdAt: string; likes: number }[]>([])
const storageKey = 'sumeru-ring:leisure-messages'
function saveMessages() { localStorage.setItem(storageKey, JSON.stringify(messages.value)) }
function submitMessage() {
  const content = message.value.trim()
  if (!content) return
  messages.value.unshift({ id: crypto.randomUUID(), mood: mood.value, content, createdAt: new Date().toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' }), likes: 0 })
  message.value = ''
  saveMessages()
}
function like(item: typeof messages.value[number]) { item.likes += 1; saveMessages() }
function remove(item: typeof messages.value[number]) { messages.value = messages.value.filter(({ id }) => id !== item.id); saveMessages() }
function surprise() {
  let next = Math.floor(Math.random() * leisureItems.length)
  if (leisureItems.length > 1 && next === lastIndex.value) next = (next + 1) % leisureItems.length
  lastIndex.value = next
}
function nextPrompt() { prompt.value = prompts[(prompts.indexOf(prompt.value) + 1) % prompts.length] ?? prompts[0] ?? '' }
onMounted(() => { try { messages.value = JSON.parse(localStorage.getItem(storageKey) ?? '[]') } catch { messages.value = [] } })
</script>

<template>
  <div class="sr-page leisure-page">
    <header class="list-heading"><div><p>工作间隙</p><h1>休息一下</h1><span>离开屏幕上的任务几分钟，去看看真正感兴趣的东西。</span></div><Coffee :size="30" /></header>
    <section class="leisure-hero sr-panel"><div><strong>来留一句话吧</strong><span>写下此刻的心情，让路过这里的人给你一个回应。</span></div><button class="prompt-button" @click="nextPrompt"><Sparkles :size="15" />{{ prompt }}</button></section>
    <div class="leisure-layout"><section class="message-panel sr-panel"><header><div><h2>休息留言墙</h2><span>{{ messages.length }} 条留言</span></div><MessageCircle :size="20" /></header><div class="message-form"><div class="mood-picker"><button v-for="item in moods" :key="item" :class="{ active: mood === item }" @click="mood = item">{{ item }}</button></div><el-input v-model="message" type="textarea" :rows="3" maxlength="120" show-word-limit :placeholder="prompt" @keydown.ctrl.enter="submitMessage"/><el-button class="sr-primary-button send-button" type="primary" :disabled="!message.trim()" @click="submitMessage"><Send :size="16" />留下这句话</el-button></div><div class="message-list"><article v-for="item in messages" :key="item.id" class="message-item"><div class="message-meta"><span class="mood-dot">{{ item.mood }}</span><time>{{ item.createdAt }}</time><button title="删除自己的留言" @click="remove(item)"><Trash2 :size="14" /></button></div><p>{{ item.content }}</p><button class="like-button" @click="like(item)"><Heart :size="14" />{{ item.likes || '回应一下' }}</button></article><el-empty v-if="!messages.length" description="还没有留言，来做第一个留下话的人吧" /></div></section><aside class="side-panel"><section class="mini-card"><header><h2>随机放松</h2><Shuffle :size="17" /></header><p>不想写留言？随机抽一个轻松去处。</p><el-button @click="surprise"><Shuffle :size="15" />换一个</el-button><strong v-if="recommendation">{{ recommendation.title }}</strong><small v-if="recommendation">{{ recommendation.description }}</small></section><section v-for="category in leisureCategories" :key="category.id" class="mini-card links-card"><h3>{{ category.title }}</h3><button v-for="item in category.items" :key="item.url" @click="open(item.url)"><Coffee :size="14" />{{ item.title }}</button></section></aside></div>
  </div>
</template>

<style scoped lang="scss">
.leisure-page{max-width:1100px;margin:0 auto}.leisure-hero{display:flex;align-items:center;gap:16px;padding:18px 20px;margin-bottom:18px;background:var(--sr-blue-soft)}.leisure-hero>div{display:flex;flex-direction:column;gap:4px;margin-right:auto}.leisure-hero strong{font-size:15px}.leisure-hero span{color:var(--sr-text-muted);font-size:12px}.prompt-button{display:flex;align-items:center;gap:6px;max-width:420px;padding:7px 10px;border:1px solid var(--sr-border);border-radius:6px;background:var(--sr-surface);color:var(--sr-text);font-size:12px;cursor:pointer}.leisure-layout{display:grid;grid-template-columns:minmax(0,1.5fr) 280px;gap:16px}.message-panel{padding:18px}.message-panel>header,.mini-card>header{display:flex;align-items:center;justify-content:space-between}.message-panel h2,.mini-card h2{margin:0;font-size:17px}.message-panel header span{margin-left:8px;color:var(--sr-text-muted);font-size:12px}.message-form{margin-top:14px}.mood-picker{display:flex;gap:6px;margin-bottom:8px}.mood-picker button{padding:5px 9px;border:1px solid var(--sr-border);border-radius:5px;background:var(--sr-surface);color:var(--sr-text-muted);font-size:11px;cursor:pointer}.mood-picker button.active{border-color:var(--sr-blue);background:var(--sr-blue-soft);color:var(--sr-blue)}.send-button{margin-top:8px}.message-list{margin-top:18px}.message-item{padding:12px 0;border-top:1px solid var(--sr-border)}.message-meta{display:flex;align-items:center;gap:8px;color:var(--sr-text-muted);font-size:11px}.message-meta button{display:grid;margin-left:auto;padding:3px;border:0;background:none;color:var(--sr-text-muted);cursor:pointer}.mood-dot{color:var(--sr-orange);font-weight:600}.message-item p{margin:8px 0;font-size:13px;line-height:1.6;white-space:pre-wrap}.like-button{display:flex;align-items:center;gap:5px;padding:3px 0;border:0;background:none;color:var(--sr-text-muted);font-size:11px;cursor:pointer}.like-button:hover{color:var(--sr-orange)}.side-panel{display:grid;align-content:start;gap:12px}.mini-card{padding:15px;border:1px solid var(--sr-border);border-radius:7px;background:var(--sr-surface)}.mini-card p{margin:10px 0;color:var(--sr-text-muted);font-size:12px;line-height:1.5}.mini-card strong,.mini-card small{display:block;margin-top:12px}.mini-card small{color:var(--sr-text-muted);font-size:11px}.links-card h3{margin:0 0 8px;font-size:13px}.links-card button{display:flex;align-items:center;gap:6px;width:100%;padding:5px 0;border:0;background:none;color:var(--sr-text-muted);font-size:12px;text-align:left;cursor:pointer}.links-card button:hover{color:var(--sr-blue)}@media(max-width:800px){.leisure-layout{grid-template-columns:1fr}.side-panel{grid-template-columns:1fr 1fr}}@media(max-width:600px){.leisure-hero{align-items:flex-start;flex-wrap:wrap}.prompt-button{max-width:none;width:100%}.side-panel{grid-template-columns:1fr}}
</style>

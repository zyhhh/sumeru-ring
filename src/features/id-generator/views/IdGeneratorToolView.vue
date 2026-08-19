<script setup lang="ts">
import { ref } from 'vue'; import { ElMessage } from 'element-plus'; import ToolPageHeader from '@/components/tool/ToolPageHeader.vue'; import ToolDocumentation from '@/components/tool/ToolDocumentation.vue'; import { DEFAULT_SNOWFLAKE_EPOCH, generateSnowflake, generateUuidV4, generateUuidV7, toggleUuidHyphens, TWITTER_SNOWFLAKE_EPOCH } from '../lib/idGenerator'
const mode=ref<'uuid-v4'|'uuid-v7'|'snowflake'>('uuid-v4');const count=ref(5);const dataCenterId=ref(1);const workerId=ref(1);const epochPreset=ref<'default'|'twitter'|'custom'>('default');const customEpoch=ref(new Date(DEFAULT_SNOWFLAKE_EPOCH));const results=ref<string[]>([]);const error=ref('')
function selectedEpoch(){return epochPreset.value==='twitter'?TWITTER_SNOWFLAKE_EPOCH:epochPreset.value==='custom'?customEpoch.value?.getTime():DEFAULT_SNOWFLAKE_EPOCH}
function generate(){try{error.value='';const epoch=selectedEpoch();if(epoch===undefined)throw new Error('请选择起始时间');results.value=Array.from({length:count.value},(_,index)=>mode.value==='uuid-v4'?generateUuidV4():mode.value==='uuid-v7'?generateUuidV7(Date.now()+index):generateSnowflake(dataCenterId.value,workerId.value,index,Date.now()+index,epoch))}catch(e){results.value=[];error.value=e instanceof Error?e.message:'生成失败'}}
function toggleHyphens(){results.value=results.value.map(toggleUuidHyphens)}
function toggleCase(){const hasLowerCase=results.value.some(item=>/[a-f]/.test(item));results.value=results.value.map(item=>hasLowerCase?item.toUpperCase():item.toLowerCase())}
async function copyAll(){await navigator.clipboard.writeText(results.value.join('\n'));ElMessage.success('全部 ID 已复制')}
const docs=[{title:'UUID v4',content:'使用浏览器加密随机数生成。生成后可批量去除连字符或转换大小写。'},{title:'UUID v7',content:'遵循 RFC 9562，将毫秒时间戳放在高位，具有大致按生成时间排序的特性；同样支持结果格式处理。'},{title:'雪花 ID',content:'采用 41 位时间、5 位数据中心 ID、5 位机器 ID、12 位序列号结构。起始时间会影响 ID 的数值大小，与后端对照时应选择相同的起始时间。'}]
</script>
<template>
  <div class="sr-page">
    <ToolPageHeader category="开发辅助" title="UUID / 雪花 ID 生成器" description="批量生成 UUID v4、UUID v7 或用于测试的雪花 ID。" :tags="['UUID','Snowflake']"/>
    <section class="tool-box sr-panel">
      <label class="sr-tool-label">ID 类型</label>
      <el-radio-group v-model="mode"><el-radio-button value="uuid-v4">UUID v4</el-radio-button><el-radio-button value="uuid-v7">UUID v7</el-radio-button><el-radio-button value="snowflake">雪花 ID</el-radio-button></el-radio-group>
      <div class="settings">
        <div class="settings-row">
          <label>生成数量<el-input-number v-model="count" class="number-control" :min="1" :max="100"/></label>
          <label v-if="mode==='snowflake'">数据中心 ID<el-input-number v-model="dataCenterId" class="number-control" :min="0" :max="31"/></label>
          <label v-if="mode==='snowflake'">机器 ID<el-input-number v-model="workerId" class="number-control" :min="0" :max="31"/></label>
        </div>
        <div v-if="mode==='snowflake'" class="settings-row epoch-row">
          <label>起始时间<el-select v-model="epochPreset" class="epoch-select"><el-option label="2020-01-01（默认）" value="default"/><el-option label="Twitter 标准" value="twitter"/><el-option label="自定义" value="custom"/></el-select></label>
          <label v-if="epochPreset==='custom'">自定义时间<el-date-picker v-model="customEpoch" class="epoch-picker" type="datetime" format="YYYY-MM-DD HH:mm:ss"/></label>
        </div>
      </div>
      <div class="actions"><el-button class="sr-primary-button" type="primary" @click="generate">生成 ID</el-button><el-button :disabled="!results.length" @click="copyAll">复制全部</el-button><el-button @click="results=[]">清空</el-button></div>
      <p v-if="error" class="error">{{error}}</p>
    </section>
    <section v-if="results.length" class="result sr-panel"><div class="result-header"><h2>生成结果</h2><div v-if="mode!=='snowflake'" class="format-actions"><el-button @click="toggleHyphens">去除/加入连字符</el-button><el-button @click="toggleCase">转大小写</el-button></div></div><code v-for="item in results" :key="item">{{item}}</code></section>
    <ToolDocumentation :sections="docs"/>
  </div>
</template>
<style scoped lang="scss">
.tool-box,.result{padding:20px}.tool-box>.sr-tool-label{display:block;margin-bottom:9px}.settings{display:grid;gap:14px;margin-top:18px}.settings-row{display:flex;align-items:center;flex-wrap:wrap;gap:14px 18px}.settings-row label{display:flex;align-items:center;gap:8px;min-height:38px;font-size:13px;font-weight:600;white-space:nowrap}.epoch-row{padding-top:14px;border-top:1px solid var(--sr-border)}.epoch-select{width:180px}.epoch-picker{width:220px}.actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.error{color:#c43f3f}.result{margin-top:14px}.result-header{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.result h2{margin:0;color:#218a5a;font-size:15px}.format-actions{display:flex;flex-wrap:wrap;gap:8px}.result code{display:block;padding:7px 10px;border-bottom:1px solid var(--sr-border);font-size:13px}@media(max-width:650px){.settings-row{align-items:stretch;flex-direction:column}.settings-row label{justify-content:space-between}.epoch-select,.epoch-picker,.number-control{width:min(100%,240px)}.result-header{align-items:flex-start;flex-direction:column}}
</style>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { BrowserQRCodeReader } from '@zxing/browser'
import { ElMessage, type UploadFile } from 'element-plus'
import QRCodeStyling from 'qr-code-styling'
import ToolDocumentation from '@/components/tool/ToolDocumentation.vue'
import ToolPageHeader from '@/components/tool/ToolPageHeader.vue'
import { buildQrContent, type QrContentType, type QrForm } from '../lib/qrContent'

const tab = ref<'generate' | 'decode'>('generate')
const preview = ref<HTMLElement>()
const logo = ref('')
const decodeResult = ref('')
const decodeError = ref('')
const form = ref<QrForm>({ type: 'text', text: '', ssid: '', password: '', encryption: 'WPA', name: '', phone: '', email: '', subject: '' })
const size = ref(512)
const level = ref<'L' | 'M' | 'Q' | 'H'>('H')
const foreground = ref('#2869C7')
const background = ref('#FFFFFF')
const dots = ref<'square' | 'dots' | 'rounded'>('rounded')
const corners = ref<'square' | 'dot' | 'extra-rounded'>('extra-rounded')
const content = computed(() => buildQrContent(form.value))

let qr: QRCodeStyling

function qrOptions() {
  return {
    width: Math.min(size.value, 320), height: Math.min(size.value, 320), data: content.value || ' ', image: logo.value || undefined,
    qrOptions: { errorCorrectionLevel: level.value }, dotsOptions: { color: foreground.value, type: dots.value },
    backgroundOptions: { color: background.value }, cornersSquareOptions: { color: foreground.value, type: corners.value },
    imageOptions: { crossOrigin: 'anonymous', margin: 6, imageSize: 0.32 },
  } as ConstructorParameters<typeof QRCodeStyling>[0]
}

onMounted(async () => {
  await nextTick()
  qr = new QRCodeStyling(qrOptions())
  if (preview.value) qr.append(preview.value)
})

watch([content, size, level, foreground, background, dots, corners, logo], async () => {
  qr?.update(qrOptions())
  await nextTick()
  if (content.value && preview.value && !preview.value.hasChildNodes()) qr?.append(preview.value)
})

// ElUpload 不自动上传文件，只负责提供统一的选择与拖拽交互。
function selectLogo(uploadFile: UploadFile) {
  if (!uploadFile.raw) return
  const reader = new FileReader()
  reader.onload = () => { logo.value = String(reader.result) }
  reader.readAsDataURL(uploadFile.raw)
}

async function download(extension: 'png' | 'svg') {
  await qr.download({ name: 'sumeru-ring-qrcode', extension })
}

async function decodeFile(file?: File) {
  if (!file) return
  decodeError.value = ''
  decodeResult.value = ''
  const url = URL.createObjectURL(file)
  try {
    decodeResult.value = (await new BrowserQRCodeReader().decodeFromImageUrl(url)).getText()
  } catch {
    decodeError.value = '未识别到二维码。请使用清晰、完整且对比度足够的图片。'
  } finally {
    URL.revokeObjectURL(url)
  }
}

function selectDecodeFile(uploadFile: UploadFile) { decodeFile(uploadFile.raw) }
function onPaste(event: ClipboardEvent) {
  const file = [...(event.clipboardData?.files ?? [])].find((item) => item.type.startsWith('image/'))
  if (file) decodeFile(file)
}
async function copyResult() {
  await navigator.clipboard.writeText(decodeResult.value)
  ElMessage.success('识别结果已复制')
}

const contentTypes: [QrContentType, string][] = [['text', '文本'], ['url', '网址'], ['wifi', 'Wi-Fi'], ['contact', '联系人'], ['email', '邮件']]
const docs = [
  { title: '内容类型', content: '文本和网址直接写入；Wi-Fi、联系人和邮件会转换为手机系统可识别的标准结构。' },
  { title: '纠错与 Logo', content: '添加 Logo 时建议选择 H 级纠错。Logo 越大、颜色对比越低，二维码越难识别。生成后请实际扫码测试。' },
  { title: '图片识别', content: '可选择、拖入或粘贴 PNG/JPG 图片。识别全程在浏览器本地执行，不调用摄像头，也不上传图片。' },
]
</script>

<template>
  <div class="sr-page" @paste="onPaste">
    <ToolPageHeader category="编码转换" title="二维码生成与识别" description="创建可定制二维码，或从本地图片中识别二维码内容。" :tags="['二维码', '图片']" />
    <el-tabs v-model="tab" class="qr-tabs"><el-tab-pane label="生成二维码" name="generate" /><el-tab-pane label="识别二维码" name="decode" /></el-tabs>

    <section v-if="tab === 'generate'" class="workspace">
      <div class="config sr-panel">
        <h2>二维码内容</h2>
        <el-radio-group v-model="form.type" class="types"><el-radio-button v-for="item in contentTypes" :key="item[0]" :value="item[0]">{{ item[1] }}</el-radio-button></el-radio-group>
        <div v-if="form.type === 'wifi'" class="form-grid"><el-input v-model="form.ssid" placeholder="Wi-Fi 名称（SSID）" /><el-input v-model="form.password" placeholder="Wi-Fi 密码" /><el-select v-model="form.encryption"><el-option label="WPA/WPA2" value="WPA" /><el-option label="WEP" value="WEP" /><el-option label="无密码" value="nopass" /></el-select></div>
        <div v-else-if="form.type === 'contact'" class="form-grid"><el-input v-model="form.name" placeholder="姓名" /><el-input v-model="form.phone" placeholder="电话" /><el-input v-model="form.email" placeholder="邮箱" /></div>
        <template v-else-if="form.type === 'email'"><div class="form-grid"><el-input v-model="form.email" placeholder="收件人邮箱" /><el-input v-model="form.subject" placeholder="邮件主题" /></div><el-input v-model="form.text" type="textarea" :rows="3" placeholder="邮件正文" /></template>
        <el-input v-else v-model="form.text" type="textarea" :rows="4" :placeholder="form.type === 'url' ? '输入完整网址' : '输入文本内容'" />

        <h2>外观设置</h2>
        <div class="form-grid"><el-select v-model="size"><el-option v-for="value in [256, 512, 768, 1024]" :key="value" :label="`${value} × ${value}`" :value="value" /></el-select><el-select v-model="level"><el-option label="L · 约 7%" value="L" /><el-option label="M · 约 15%" value="M" /><el-option label="Q · 约 25%" value="Q" /><el-option label="H · 约 30%" value="H" /></el-select><el-select v-model="dots"><el-option label="方形点阵" value="square" /><el-option label="圆点" value="dots" /><el-option label="圆角点阵" value="rounded" /></el-select><el-select v-model="corners"><el-option label="方形定位点" value="square" /><el-option label="圆形定位点" value="dot" /><el-option label="大圆角定位点" value="extra-rounded" /></el-select><label>前景色<el-color-picker v-model="foreground" /></label><label>背景色<el-color-picker v-model="background" /></label></div>
        <div class="upload-actions"><el-upload :auto-upload="false" :show-file-list="false" accept="image/png,image/jpeg,image/svg+xml" :on-change="selectLogo"><el-button>选择中心 Logo</el-button></el-upload><el-button v-if="logo" @click="logo = ''">移除 Logo</el-button></div>
        <div class="tip">添加 Logo 时建议使用 H 级纠错，并保持前景与背景有足够对比度。</div>
      </div>

      <div class="preview sr-panel"><h2>实时预览</h2><div v-if="content" ref="preview" class="qr-preview"></div><div v-else class="qr-empty">输入内容后显示二维码预览</div><span>{{ size }} × {{ size }} · {{ level }} 级纠错</span><div><el-button class="sr-primary-button" type="primary" :disabled="!content" @click="download('png')">下载 PNG</el-button><el-button :disabled="!content" @click="download('svg')">下载 SVG</el-button></div></div>
    </section>

    <section v-else class="decoder sr-panel">
      <h2>上传二维码图片</h2><p>拖入图片、点击选择文件，或直接在页面粘贴截图。</p>
      <el-upload drag :auto-upload="false" :show-file-list="false" accept="image/*" :on-change="selectDecodeFile"><div class="upload-title">拖入二维码图片</div><div class="upload-subtitle">或点击选择 PNG / JPG 文件</div></el-upload>
      <div v-if="decodeResult" class="decoded"><span>识别结果</span><pre>{{ decodeResult }}</pre><el-button class="sr-primary-button" type="primary" @click="copyResult">复制结果</el-button></div>
      <p v-if="decodeError" class="error">{{ decodeError }}</p>
    </section>
    <ToolDocumentation :sections="docs" />
  </div>
</template>

<style scoped lang="scss">
.qr-tabs{margin-bottom:18px}.qr-tabs :deep(.el-tabs__item){font-size:14px;font-weight:600}.qr-tabs :deep(.el-tabs__active-bar){background:var(--sr-orange)}.qr-tabs :deep(.el-tabs__item.is-active){color:var(--sr-orange)}
.workspace{display:grid;grid-template-columns:minmax(0,2fr) minmax(230px,1fr);gap:14px;align-items:start}.config,.preview,.decoder{padding:20px}.config h2,.preview h2,.decoder h2{margin:0 0 15px;font-size:15px}.config h2:not(:first-child){margin-top:22px}.types{margin-bottom:15px}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0}.form-grid label{display:flex;align-items:center;gap:9px;color:var(--sr-text-muted);font-size:13px;font-weight:600}.upload-actions{display:flex;gap:8px;margin-top:12px}.tip{margin-top:14px;padding:12px;border-left:3px solid var(--sr-orange);background:var(--sr-orange-soft);font-size:13px;line-height:1.6}.preview{text-align:center}.qr-preview{display:flex;justify-content:center;min-height:320px}.qr-empty{display:grid;place-items:center;min-height:320px;color:var(--sr-text-muted);font-size:13px}.preview span{display:block;margin:10px 0 14px;color:var(--sr-text-muted);font-size:12px}.decoder{min-height:350px;text-align:center}.decoder p{color:var(--sr-text-muted);font-size:13px}.decoder :deep(.el-upload){width:100%}.decoder :deep(.el-upload-dragger){border-color:var(--sr-border);background:var(--sr-surface-soft)}.upload-title{color:var(--sr-blue);font-size:15px;font-weight:600}.upload-subtitle{margin-top:6px;color:var(--sr-text-muted);font-size:12px}.decoded{margin-top:22px;text-align:left}.decoded span{font-size:12px;color:var(--sr-text-muted)}.decoded pre{padding:14px;border-radius:var(--sr-radius-control);background:var(--sr-surface-soft);font-size:13px;line-height:1.6;white-space:pre-wrap;word-break:break-all}.error{color:#c43f3f!important}
@media(max-width:800px){.workspace{grid-template-columns:1fr}.form-grid{grid-template-columns:1fr}}
</style>

import { compareText } from './lib/textDiff'

self.onmessage = (event: MessageEvent<{ original: string; modified: string; ignoreWhitespace: boolean }>) => {
  try { self.postMessage({ ok: true, result: compareText(event.data.original, event.data.modified, event.data.ignoreWhitespace) }) }
  catch (error) { self.postMessage({ ok: false, error: error instanceof Error ? error.message : '文本比较失败' }) }
}

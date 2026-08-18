import {processJson, type JsonAction} from './lib/jsonProcessor'

self.onmessage = (event: MessageEvent<{ input: string; action: JsonAction }>) => {
    try {
        self.postMessage({ok: true, result: processJson(event.data.input, event.data.action)})
    } catch (error) {
        self.postMessage({ok: false, error: error instanceof Error ? error.message : 'JSON 处理失败'})
    }
}


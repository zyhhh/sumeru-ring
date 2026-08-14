import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

const devHosts = new Set(['localhost', '127.0.0.1', '::1', '192.168.10.88'])

export default defineConfig({
  plugins: [
    vue(),
    {
      name: 'restrict-dev-hosts',
      configureServer(server) {
        server.middlewares.use((request, response, next) => {
          const host = request.headers.host ?? ''
          const hostname = host.startsWith('[')
            ? host.slice(1, host.indexOf(']'))
            : host.split(':')[0]
          if (hostname && devHosts.has(hostname)) return next()
          response.statusCode = 403
          response.end('Forbidden host')
        })
      },
    },
  ],
  server: {
    host: '0.0.0.0',
  },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    rollupOptions: {
      output: {
        // 第三方框架通常变更较少，单独分包后浏览器可以长期缓存。
        manualChunks: {
          vue: ['vue', 'vue-router', 'pinia'],
          'element-plus': ['element-plus'],
        },
      },
    },
  },
})

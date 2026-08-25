import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig, type Plugin } from 'vite'
import Icons from 'unplugin-icons/vite'
import { VitePWA } from 'vite-plugin-pwa'
import { buildRobots, buildSitemap, parseSiteUrl, PUBLIC_TOOL_ROUTES } from './src/seo-assets.ts'

function staticSeoAssets(): Plugin {
  const siteUrl = parseSiteUrl(process.env.CRAFTCHEST_SITE_URL ?? process.env.CF_PAGES_URL)
  return {
    name: 'craftchest-static-seo',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: buildRobots(siteUrl) })
      if (siteUrl) {
        this.emitFile({
          type: 'asset',
          fileName: 'sitemap.xml',
          source: buildSitemap(siteUrl, PUBLIC_TOOL_ROUTES),
        })
      }
    },
  }
}

export default defineConfig({
  build: {
    // OpenCC 的本地词典是不可拆细的静态数据；独立命名后可从 PWA 预缓存中精确排除。
    chunkSizeWarningLimit: 1300,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('/opencc-js/')) return 'opencc'
        },
      },
    },
  },
  plugins: [
    staticSeoAssets(),
    vue(),
    tailwindcss(),
    // 图标构建期内联（@iconify-json/lucide），运行时零外部请求
    Icons({ compiler: 'vue3' }),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: null, // main.ts 手动 registerSW
      manifest: {
        name: 'CraftChest · 合成箱',
        short_name: 'CraftChest',
        description:
          '纯前端在线工具箱：中文文本工具与前端小玩具。All-in-browser toolbox, no backend.',
        lang: 'zh-CN',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#f7f2e9',
        theme_color: '#f7f2e9',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        // QA 矩阵与应用同源；避免已安装的 SW 将 /__qa 导航回退到应用首页。
        navigateFallbackDenylist: [/^\/__qa(?:\/|\?|$)/],
        // 词典块约 1.2MB：避免每次安装 PWA 都下载；访问简繁转换后再长期缓存。
        globIgnores: ['**/opencc-*.js'],
        runtimeCaching: [
          {
            urlPattern: /\/assets\/opencc-[\w-]+\.js$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'opencc-dictionaries-v1',
              cacheableResponse: { statuses: [0, 200] },
              expiration: {
                maxEntries: 2,
                maxAgeSeconds: 60 * 60 * 24 * 365,
              },
            },
          },
        ],
      },
    }),
  ],
})

import { defineCraft, type CraftMeta } from '@craftchest/craft-core'

export const appIconCraft: CraftMeta = defineCraft({
  id: 'app-icon',
  recipeVersion: 2,
  title: { zh: '应用图标工坊', en: 'App Icon Workshop' },
  description: {
    zh: '把一张 PNG 在本地生成 favicon、PWA、maskable、Apple 图标与交付包。',
    en: 'Turn one PNG into favicon, PWA, maskable, Apple, and delivery assets locally.',
  },
  inputs: [
    {
      id: 'source-png',
      kind: 'file',
      label: { zh: '源 PNG', en: 'Source PNG' },
      required: true,
      acceptedMediaTypes: ['image/png'],
    },
  ],
  steps: [
    {
      id: 'diagnose-image',
      label: { zh: '诊断图片', en: 'Diagnose image' },
      service: { kind: 'chest-service', id: 'app-icon/image-diagnostics', version: 1 },
      consumes: ['source-png'],
      produces: ['image-diagnostics'],
    },
    {
      id: 'render-icons',
      label: { zh: '渲染图标', en: 'Render icons' },
      service: { kind: 'chest-service', id: 'app-icon/icon-renderer', version: 1 },
      consumes: ['source-png'],
      produces: ['icon-files'],
    },
    {
      id: 'assemble-package',
      label: { zh: '组装交付包', en: 'Assemble delivery package' },
      service: { kind: 'chest-service', id: 'app-icon/package-assembler', version: 1 },
      consumes: ['icon-files'],
      produces: ['favicon-package'],
    },
  ],
})

import { defineCraft, type CraftMeta } from '@craftchest/craft-core'

export const webVisualCraft: CraftMeta = defineCraft({
  id: 'web-visual',
  recipeVersion: 1,
  title: { zh: 'Web 视觉配方', en: 'Web Visual Recipe' },
  description: {
    zh: '输入品牌色，生成对比度检查、色阶、渐变与可直接使用的设计令牌文件。',
    en: 'Turn brand colors into contrast checks, color ramps, a gradient, and ready-to-use token files.',
  },
  inputs: [
    {
      id: 'brand-color',
      kind: 'value',
      label: { zh: '品牌主色', en: 'Brand color' },
      required: true,
    },
    {
      id: 'accent-color',
      kind: 'value',
      label: { zh: '辅助色', en: 'Accent color' },
      required: true,
    },
    {
      id: 'gradient-options',
      kind: 'value',
      label: { zh: '渐变设置', en: 'Gradient settings' },
      required: true,
    },
  ],
  steps: [
    {
      id: 'check-contrast',
      label: { zh: '检查文字对比度', en: 'Check text contrast' },
      service: { kind: 'chest-service', id: 'contrast-checker/rateContrast', version: 1 },
      consumes: ['brand-color', 'accent-color'],
      produces: ['contrast-ratings'],
    },
    {
      id: 'compose-gradient',
      label: { zh: '组合渐变', en: 'Compose gradient' },
      service: { kind: 'chest-service', id: 'gradient-gen/buildGradient', version: 1 },
      consumes: ['brand-color', 'accent-color', 'gradient-options'],
      produces: ['gradient-css'],
    },
  ],
})

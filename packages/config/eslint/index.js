import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'
import tseslint from 'typescript-eslint'
import globals from 'globals'

/**
 * CraftChest 共享 ESLint 扁平配置预设。
 * 依赖（eslint 系列包）由仓库根 devDependencies 提供，本包只承载配置。
 */
export default [
  {
    ignores: [
      '**/dist/**',
      '**/dev-dist/**',
      '**/coverage/**',
      '**/node_modules/**',
      '**/*.vue.d.ts',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
  },
  {
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['**/*.config.ts', '**/eslint.config.js'],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
  {
    rules: {
      // 测试文件里的未挂起断言等由 vitest 管理，放宽部分规则
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  },
  {
    // SPEC §4：工具视图组件固定命名为 Tool.vue（四件套之一），豁免多词组件名规则
    files: ['**/tools-*/src/**/Tool.vue'],
    rules: { 'vue/multi-word-component-names': 'off' },
  },
  skipFormatting,
]

export default {
  app: {
    tagline: 'Craft 把材料做成成品，Chest 提供可独立使用与复用的工具。',
    description: 'CraftChest：Craft 成品工坊与 Chest 单项工具库存，所有处理均在浏览器本地完成。',
  },
  nav: {
    home: '首页',
    openMenu: '打开导航菜单',
    closeMenu: '关闭导航菜单',
    crafts: '成品工坊',
    chest: '单项工具',
    sections: {
      zh: '中文工具',
      fe: '前端工具',
    },
  },
  theme: {
    system: '主题：跟随系统',
    light: '主题：浅色',
    dark: '主题：深色',
  },
  home: {
    heroTitle: 'CraftChest · 合成箱',
    heroSub:
      'Craft 把输入材料做成可直接使用的成果；Chest 收纳可独立使用、也可供 Craft 复用的工具。所有处理都在浏览器本地完成。',
    badge: 'CRAFT 成品工坊 · CHEST 单项工具',
    searchPlaceholder: '搜索 Craft 与单项工具…（标题 / 描述 / 关键词）',
    resultsTitle: '搜索结果',
    noResults: '没有匹配的 Craft 或工具，换个关键词试试？',
    itemCount: '{count} 项',
  },
  command: {
    title: '快速打开 Craft 与工具',
    description: '搜索全部 Craft 与单项工具',
    shortcut: '快速打开',
    hint: '也可按 Ctrl K 快速打开工具',
    placeholder: '搜索标题、描述或关键词…',
    empty: '没有匹配的工具',
    recent: '最近使用',
    navigateHint: '选择并打开',
    closeHint: '关闭',
  },
  privacy: {
    title: '数据不出浏览器',
    promise: '所有计算均在本地完成；无账号、无遥测、无追踪，也不会上传你的输入。',
  },
  notFound: {
    title: '404 · 走进了空箱子',
    message: '这个地址不存在或工具已被移除。',
    backHome: '回到首页',
  },
} as const

export default {
  app: {
    tagline: '合成你的小工具箱',
  },
  nav: {
    home: '首页',
    sections: {
      zh: '中文工具',
      fe: '前端玩具',
    },
  },
  home: {
    heroTitle: 'CraftChest · 合成箱',
    heroSub:
      '纯前端工具箱：所有计算在浏览器完成，零后端、零外部 API，数据只存本地。',
    searchPlaceholder: '搜索工具…（标题 / 描述 / 关键词）',
    resultsTitle: '搜索结果',
    noResults: '没有匹配的工具，换个关键词试试？',
    toolCount: '{count} 个工具',
  },
  notFound: {
    title: '404 · 走进了空箱子',
    message: '这个地址不存在或工具已被移除。',
    backHome: '回到首页',
  },
} as const

export default {
  app: {
    tagline: 'Compose your little toolbox',
  },
  nav: {
    home: 'Home',
    sections: {
      zh: 'Chinese Tools',
      fe: 'Front-end Tools',
    },
  },
  home: {
    heroTitle: 'CraftChest',
    heroSub:
      'Fully client-side toolbox: every computation runs in your browser — no backend, no external APIs, data stays local.',
    searchPlaceholder: 'Search tools… (title / description / keywords)',
    resultsTitle: 'Search results',
    noResults: 'No matching tools — try another keyword?',
    toolCount: '{count} tools',
  },
  notFound: {
    title: '404 · Empty chest',
    message: 'This address does not exist, or the tool has been removed.',
    backHome: 'Back home',
  },
} as const

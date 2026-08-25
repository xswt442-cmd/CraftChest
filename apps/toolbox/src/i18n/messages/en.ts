export default {
  app: {
    tagline: 'Compose your little toolbox',
    description: 'An all-in-browser toolbox for Chinese text and front-end interactions.',
  },
  nav: {
    home: 'Home',
    sections: {
      zh: 'Chinese Tools',
      fe: 'Front-end Tools',
    },
  },
  theme: {
    system: 'Theme: system',
    light: 'Theme: light',
    dark: 'Theme: dark',
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
  command: {
    title: 'Quick open tools',
    description: 'Search every tool and navigate',
    shortcut: 'Quick open',
    placeholder: 'Search titles, descriptions, or keywords…',
    empty: 'No matching tools',
    recent: 'Recently used',
    navigateHint: 'Select and open',
    closeHint: 'Close',
  },
  privacy: {
    title: 'Your data stays in your browser',
    promise: 'All processing is local: no accounts, telemetry, tracking, or uploaded input.',
  },
  notFound: {
    title: '404 · Empty chest',
    message: 'This address does not exist, or the tool has been removed.',
    backHome: 'Back home',
  },
} as const

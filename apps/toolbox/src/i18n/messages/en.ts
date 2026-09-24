export default {
  app: {
    tagline: 'Craft turns inputs into outputs; Chest holds reusable tools.',
    description:
      'CraftChest combines ready-to-use Craft recipes with standalone Chest tools. All processing stays in your browser.',
  },
  nav: {
    home: 'Home',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    crafts: 'Crafts',
    chest: 'Standalone Tools',
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
      'Crafts turn inputs into ready-to-use outputs. Chest holds standalone tools that Crafts can reuse. Everything runs locally in your browser.',
    badge: 'CRAFT RECIPES · CHEST TOOLS',
    searchPlaceholder: 'Search Crafts and tools… (title / description / keywords)',
    resultsTitle: 'Search results',
    noResults: 'No matching Craft or tools — try another keyword?',
    itemCount: '{count} items',
  },
  command: {
    title: 'Quick open Crafts and tools',
    description: 'Search all Crafts and standalone tools',
    shortcut: 'Quick open',
    hint: 'Press Ctrl K to open any tool',
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

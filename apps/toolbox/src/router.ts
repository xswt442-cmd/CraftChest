import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { hasHashState, type ToolSection } from '@craftchest/toolkit-core'

/**
 * /zh/:id 与 /fe/:id 承载 Chest 工具页，/craft/:id 承载成品配方页。
 * 工具与 Craft 组件按路由懒加载，保持代码分割。
 */
export const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue'),
    },
    {
      path: '/zh/:id',
      name: 'tool-zh',
      component: () => import('./views/ToolView.vue'),
      props: (route: RouteLocationNormalized) => ({
        section: 'zh' as ToolSection,
        id: String(route.params.id),
      }),
    },
    {
      path: '/fe/:id',
      name: 'tool-fe',
      component: () => import('./views/ToolView.vue'),
      props: (route: RouteLocationNormalized) => ({
        section: 'fe' as ToolSection,
        id: String(route.params.id),
      }),
    },
    {
      path: '/craft/:id',
      name: 'craft',
      component: () => import('./views/CraftView.vue'),
      props: (route: RouteLocationNormalized) => ({ id: String(route.params.id) }),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('./views/NotFoundView.vue'),
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    // #s= 是工具状态协议，不是页面锚点；交给工具组件解码，避免当 CSS selector 滚动。
    if (_to.hash && !hasHashState(_to.hash)) return { el: _to.hash }
    return { top: 0 }
  },
})

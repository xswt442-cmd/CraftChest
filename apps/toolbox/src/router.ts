import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized } from 'vue-router'
import { hasHashState, type ToolSection } from '@craftchest/toolkit-core'

/**
 * 路由表由注册表派生：/zh/:id 与 /fe/:id 两条动态路由承载全部工具页，
 * 工具组件经 defineAsyncComponent 二次懒加载，保持路由级代码分割（SPEC §4）。
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

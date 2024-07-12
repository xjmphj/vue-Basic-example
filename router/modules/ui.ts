import type { RouteRecordRaw } from 'vue-router';
export const uiRoutes: RouteRecordRaw[] = [
  {
    path: '/ui',
    redirect: '/ui/drawer',
    name: 'ui-demo',
    children: [
      {
        path: 'drawer',
        name: 'ui-demo-drawer',
        component: () => import('@/page/ui/drawer/index.vue'),
      },
      {
        path: 'dialog',
        name: 'ui-demo-dialog',
        component: () => import('@/page/ui/dialog/index.vue'),
      },
      {
        path: 'tree',
        name: 'ui-demo-tree',
        component: () => import('@/page/ui/tree/index.vue'),
      },
      {
        path: 'empty',
        name: 'ui-demo-empty',
        component: () => import('@/page/ui/empty/index.vue'),
      },
      {
        path: 'ch',
        name: 'ui-demo-ch',
        component: () => import('@/page/ui/ch/index.vue'),
      },
    ],
  },
];

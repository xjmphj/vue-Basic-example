import type { RouteRecordRaw } from 'vue-router';
import Main from '@/page/main/index.vue';
import Home from '@/views/wel/index.vue';
import { uiRoutes } from './ui';
// import AddNewRules from '@/views/businessRules/addNewRules/index.vue';
//！！！写死的业务路由不要提交，提交了权限会有问题。

export const rootRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    meta: {
      noNeedToken: true,
    },
    name: 'login',
    component: () => import('@/page/login/index.vue'),
  },
  {
    path: '/oplogin',
    name: 'oplogin',
    meta: {
      noNeedToken: true,
    },
    component: () => import('@/page/operation-login/index.vue'),
  },
  {
    path: '/welcome',
    name: 'welcome',
    redirect: '/welcome/index',
    component: Main,
    children: [
      {
        path: '/welcome/index',
        name: 'welcome-index',
        component: () => import('@/page/welcome/index.vue'),
        meta: {
          label: '欢迎',
        },
      },
      {
        path: '/welcome/demo',
        component: () => import('@/views/demo/index.vue'),
      },
    ],
  },
  {
    path: '/icon',
    redirect: '/icon/index',
    component: Main,
    name: 'icon',
    children: [
      {
        path: '/icon/index',
        name: 'icon-index',
        component: () => import('@/page/icon/index.vue'),
      },
    ],
  },
  {
    path: '/ui',
    redirect: '/ui/index',
    component: Main,
    name: 'ui',
    children: [
      {
        path: '/ui/index',
        name: 'ui-index',
        component: () => import('@/views/ui/index.vue'),
      },
    ],
  },
  {
    path: '/error',
    redirect: '/error/404',
    component: Main,
    name: 'error',
    children: [
      {
        path: '404',
        component: () => import('@/page/error/404.vue'),
        name: 'error-404',
      },
    ],
  },
  {
    path: '/',
    component: Main,
    name: 'main',
    redirect: '/index',
    meta: {
      label: '首页',
    },
    children: [
      {
        path: 'index',
        name: 'home',
        component: Home,
      },
      {
        path: 'custom-page',
        name: 'custom-page',
        redirect: '/custom-page/design',
        children: [
          {
            path: 'design',
            name: 'custom-page-design',
            component: () => import('@develop/views/custom-page/design/index.vue'),
            meta: {
              label: '自定义页面设计器',
            },
          },
          // {
          //   path: 'preview/:pageCode',
          //   name: 'custom-page-preview',
          //   component: () => import('@core/views/custom-page/preview/index.vue'),
          //   meta: {
          //     label: '自定义页面运行态',
          //   },
          // },
          {
            path: 'demo',
            name: 'custom-page-demo',
            component: () => import('@core/views/custom-page/preview/demo.vue'),
            meta: {
              label: '自定义页面调试',
            },
          },
        ],
      },
      {
        path: '/logic/debug',
        name: 'logic-debug',
        component: () => import('@develop/views/logic-arrangement/debug/index.vue'),
        meta: {
          label: '逻辑编排调试',
        },
      },
    ],
  },
  {
    path: '/style/lei-template',
    // redirect: '/style/lei-template',
    component: Main,
    name: 'style-lei-template',
    children: [
      {
        path: '/style/lei-template',
        name: 'leis组件',
        component: () => import('@/views/style/lei-template/index.vue'),
      },
    ],
  },
  {
    path: '/style/button',
    name: 'style-button',
    component: Main,
    children: [
      {
        path: '/style/button',
        name: '按钮demo',
        component: () => import('@/views/style/button/index.vue'),
      },
    ],
  },
  {
    path: '/style/input',
    name: 'style-input',
    component: Main,
    children: [
      {
        path: '/style/input',
        name: 'input-demo',
        component: () => import('@/views/style/input/index.vue'),
      },
    ],
  },
  // {
  //   path: '/interface',
  //   component: Main,
  //   redirect: '/interface/list',
  //   children: [
  //     {
  //       path: '/interface/list',
  //       name: 'interface-list',
  //       component: () => import('@develop/views/interface/list.vue'),
  //     },
  //   ],
  // },
  {
    path: '/interface/detail/:id/:apiSetCode?',
    name: '',
    component: () => import('@develop/views/interface/detail/index.vue'),
  },
  {
    path: '/style/font',
    name: 'font',
    component: Main,
    children: [
      {
        path: '/style/font',
        name: 'font-demo',
        component: () => import('@/views/style/font/index.vue'),
      },
    ],
  },
  ...uiRoutes,
  // 调试自定义页面
  {
    path: '/debug',
    name: 'debug',
    component: () => import('@/page/custom-page-debug/index.vue'),
  },
  // 调试列表弹窗
  {
    path: '/debug-list',
    name: 'debugList',
    component: () => import('@/core/views/list-previewer/testOpen.vue'),
    props: (route) => ({ pageCode: route.query.pageCode, inRoutePage: true, width: 80 }),
  },
  {
    path: '/bill-print',
    name: 'bill-print',
    component: () => import('@/components/bill-print/index.vue'),
  },
  {
    path: '/fish-agriculture-and-livestock-print',
    name: 'fish-agriculture-and-livestock-print',
    component: () => import('@/components/bill-print/fish/FishaAndL.vue'),
  },
];

const appRoutes: RouteRecordRaw[] = [
  {
    path: '/pre-warning/warning-create/index',
    component: Main,
    name: 'create',
    children: [
      {
        path: '/pre-warning/warning-create/index',
        name: 'create-index',
        component: () => import('@/views/pre-warning/warning-create/index.vue'),
        meta: {
          label: '创建预警',
        },
      },
    ],
  },
  {
    path: '/gule-draw',
    redirect: '/gule/gule-draw/index',
    component: Main,
    name: 'gule-draw',
    children: [
      {
        path: '/gule/gule-draw/index',
        name: '画布',
        component: () => import('@develop/views/gule/gule-draw/index.vue'),
      },
    ],
  },
  {
    path: '/model-rules/validateRules',
    redirect: '/model-rules/validateRules',
    component: Main,
    name: 'model-rules-validateRules',
    children: [
      // {
      //   path: '/model-rules/index',
      //   name: '模型规则',
      //   component: () => import('@/views/model-rules/index.vue'),
      // },
      {
        path: '/model-rules/validateRules',
        name: '模型必填校验',
        component: () => import('@/views/model-rules/components/validateRules.vue'),
      },
      {
        path: '/model-rules/validateBusiness',
        name: '模型业务校验',
        component: () => import('@/views/model-rules/components/validateBusiness.vue'),
      },
    ],
  },
  {
    path: '/view-design/design/:btnPermissionId/:id?',
    name: 'design',
    component: () => import('@develop/views/view-design/design.vue'),
    meta: {
      label: '视图设计',
    },
  },
  {
    path: '/dynamic-rapport',
    redirect: '/dynamic-rapport/dynamic-design',
    component: Main,
    name: 'dynamic-design-home',
    children: [
      {
        path: 'dynamic-design',
        name: 'dynamic-design',
        component: () => import('@/views/dynamic-rapport/dynamic-design/index.vue'),
        meta: {
          label: '数据集设计',
        },
      },
    ],
  },
  {
    path: '/dynamic-rapport',
    redirect: '/dynamic-rapport/list',
    component: Main,
    name: 'dynamic-rapport-home',
    children: [
      {
        path: 'list',
        name: 'list',
        component: () => import('@/views/dynamic-rapport/list/index.vue'),
        meta: {
          label: '数据集列表',
        },
      },
    ],
  },
  {
    path: '/page-setup',
    redirect: '/page-setup/index',
    component: Main,
    name: 'page-setup',
    children: [
      {
        path: '/page-setup/index',
        name: '页面设计器',
        component: () => import('@/views/page-setup/index.vue'),
      },
      {
        path: '/page-setup/list-designer',
        name: '列表设计器',
        props: (route) => ({ pageCode: route.query.pageCode }),
        component: () => import('@/views/page-setup/list-designer/index.vue'),
      },
      {
        path: '/page-setup/selector-designer',
        name: '选择器设计器',
        props: (route) => ({ pageCode: route.query.pageCode }),
        component: () => import('@/views/page-setup/selector-designer/index.vue'),
      },
      {
        path: '/page-setup/test',
        name: '选择器设计器预览',
        props: (route) => ({ pageCode: route.query.pageCode }),
        component: () => import('@/views/page-setup/selector-designer/TestDialog.vue'),
      },
      // {
      //   path: '/page-setup/tab-list-designer',
      //   name: '多页签列表页',
      //   props: (route) => ({ pageCode: route.query.pageCode }),
      //   component: () => import('@/views/page-setup/tab-list-designer/index.vue'),
      // },
      {
        path: '/page-setup/tabs-list-designer',
        name: '多页签列表页',
        props: (route) => ({ pageCode: route.query.pageCode }),
        component: () => import('@/views/page-setup/tabs-list-designer/index.vue'),
      },
    ],
  },
  {
    path: '/preview-app',
    redirect: '/preview-app/index',
    component: Main,
    name: 'preview-app',
    children: [
      {
        path: '/preview-app/index/:tenant_id/:pageCode/:pageStyle',
        name: '',
        component: () =>
          import('@/views/page-setup/avue-form-design/components/widget/drawer/preview.vue'),
      },
    ],
  },
  {
    path: '/logic/detail',
    name: '逻辑编排画布详情',
    component: () => import('@develop/views/logic-arrangement/new/index.vue'),
  },
  {
    path: '/view-design/cus_design',
    name: '视图编辑',
    component: () => import('@develop/views/view-design/cus-design/index.vue'),
  },
  {
    path: '/message-center/designer',
    name: '消息中心配置',
    component: () => import('@develop/views/message-center/message-designer/index.vue'),
  },
  // 开发的时候使用的路径
  {
    path: '/sheet',
    name: 'luckysheet',
    component: () => import('@develop/views/sheet/index.vue'),
  },
];
const routes: RouteRecordRaw[] = [...rootRoutes, ...appRoutes];

export default routes;

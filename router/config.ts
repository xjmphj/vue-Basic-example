import type { RouteComponent } from 'vue-router';
declare type RawRouteComponent = RouteComponent | Lazy<RouteComponent>;

export const routesMapping: Record<string, RawRouteComponent> = {
  '/logic/list': () => import('@develop/views/logic-arrangement/list/index.vue'),
  '/schedule/list': () => import('@/views/schedule/list/index.vue'),
};
export const needAddIndexRoute = ['/import-template/list', '/import-template/log'];

export const developRoutesMapping: Record<string, RawRouteComponent> = {
  '/app-integration-menu/index': () => import('@develop/views/app-menu/integration.vue'),
  '/app-menu/index': () => import('@develop/views/app-menu/index.vue'),
  '/app-management/list/index': () => import('@develop/views/app-management/list/index.vue'),
  '/gule/gule-list/index': () => import('@develop/views/gule/gule-list/index.vue'),
  '/view-design/list': () => import('@develop/views/view-design/list.vue'),
  '/interface/list': () => import('@develop/views/interface/list.vue'),
  '/message-center/list': () => import('@develop/views/message-center/message-list/index.vue'),
  '/message-center/message-log': () =>
    import('@develop/views/message-center/message-log/index.vue'),
  '/emailTemplate/list': () =>
    import('@develop/views/message-center/email-template/list/index.vue'),
  '/email-config/list': () => import('@develop/views/message-center/email-config/list.vue'),
};
// historyTags 黑名单，不加入tag标签
export const historyTagsBlackList = [
  '/welcome/index',
  '/welcome',
  '/logic/detail',
  '/view-design/cus_design',
  '/message-center/designer',
  '/bill-print',
  '/fish-agriculture-and-livestock-print',
  '/sheet',
];

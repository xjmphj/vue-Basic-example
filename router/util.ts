import type { RouteItem } from '@/api/user';
import type { Router, RouteRecordRaw } from 'vue-router';
import { routesMapping, needAddIndexRoute, developRoutesMapping } from './config';
import { CUSTOM_PAGE_ROUTE_PREFIX } from '@core/views/custom-page/preview/config/constant';
import { getUrlPathParam } from '@/utils/utils';
const viewBase = '/src/views';
const modulesRoutes = import.meta.glob([
  `/src/views/**/*.{vue,tsx}`,
  `!/src/develop/views/logic-arrangement/*.{vue,tsx}`,
  `!/src/views/schedule/*.{vue,tsx}`,
  `!/src/views/custom-page/*.{vue,tsx}`,
  `!/src/development/views/custom-page/*.{vue,tsx}`,
  `!/src/core/views/custom-page/*.{vue,tsx}`,
  `!/src/production/views/custom-page/*.{vue,tsx}`,
]);

// 找到最底层的子路由的path，否则逻辑会走到else if (!ret.redirect)，在菜单上点击最里层的菜单时会匹配到对应的todo.vue
function resolveRouteRedirect(routeItem: RouteItem): string {
  if (!routeItem.children?.length) return '';
  const firstChildren = routeItem.children[0];
  if (firstChildren.children?.length) {
    return resolveRouteRedirect(firstChildren);
  } else {
    return firstChildren.path;
  }
}
export const formatAsyncRoutes = (routes: RouteItem[]) => {
  return routes.map((route) => {
    const ret = {} as RouteRecordRaw;
    ret.path = route.path.split('?')[0];
    ret.name = (route.id || route.code || '') + route.name;
    ret.meta = {
      label: route.name,
      ...getUrlPathParam(route.path),
      isClose: route.isClose || 0,
      isSwitchover: route.isSwitchover || 0,
    };
    if (route.children && route.children.length > 0) {
      ret.redirect = resolveRouteRedirect(route);
      ret.children = formatAsyncRoutes(route.children);
    }
    if (needAddIndexRoute.includes(route.path)) {
      ret.component = modulesRoutes[`${viewBase}${route.path}/index.vue`];
    }
    // component赋值
    else if (routesMapping[route.path]) {
      ret.component = routesMapping[route.path];
    } else if (developRoutesMapping[route.path]) {
      ret.component = developRoutesMapping[route.path];
    } else if (modulesRoutes[`${viewBase}${route.path}.vue`]) {
      ret.component = modulesRoutes[`${viewBase}${route.path}.vue`];
    } else if (route.path.includes(CUSTOM_PAGE_ROUTE_PREFIX)) {
      ret.component = () => import('@core/views/custom-page/preview/index.vue');
    } else if (route.path.includes('/export/log-list')) {
      ret.component = () => import('@/views/export-template/log/index.vue');
    } else if (route.path.includes('/export/log-service-list')) {
      ret.component = () => import('@/views/export-template/log/newIndex.vue');
    } else if (route.path.includes('/export-template/printingService')) {
      ret.component = () => import('@/views/export-template/printingService.vue');
    } else if (route.path.includes('/page-setup/tabs-list-designer-preview')) {
      ret.component = () => import('@/views/page-setup/tabs-list-designer/stage/Preview.vue');
      ret.props = { inRoutePage: true };
    } else if (route.path.includes('/page-setup/list-designer-preview')) {
      ret.component = () => import('@/views/page-setup/list-designer/stage/Preview.vue');
      ret.props = { inRoutePage: true };
    } else if (!ret.redirect && !route.children) {
      ret.component = () => import('@/page/error/todo.vue');
    }
    return ret;
  });
};

export const addPathMatch = (router: Router) => {
  if (!router.hasRoute('pathMatch')) {
    router.addRoute({
      path: '/:pathMatch(.*)',
      name: 'pathMatch',
      redirect: '/error/404',
    });
  }
};

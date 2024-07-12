import routes from './modules/index';
import { createRouter, createWebHistory } from 'vue-router';
import { userInfo } from '@/store/index';
import { whiteListNoLogin } from '@/config/website';
import NProgress from 'nprogress';
import { useRouterHistory } from '@/store/routerHistory';
import { getStorage, setStorage } from '@/utils/storage';
import { APP_ID } from '@/config/storage';
import { historyTagsBlackList } from '@/router/config';
import { storeToRefs } from 'pinia';
import { addPathMatch, formatAsyncRoutes } from './util';
const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userStore = userInfo();
  const { fetchedMenus, accessToken: token } = storeToRefs(userStore);
  NProgress.start();
  if (whiteListNoLogin.includes(to.path)) {
    next();
  } else if (token.value) {
    if (!fetchedMenus.value) {
      resetRouter();
      userStore
        .getMenus()
        .then(() => {
          const formatted = formatAsyncRoutes(userStore.allRoutes);
          formatted.forEach((item) => {
            router.addRoute('main', item);
          });
          addPathMatch(router);
          next({ ...to, replace: true });
        })
        .finally(() => {
          NProgress.done();
        });
    } else {
      const routerHistory = useRouterHistory();
      if (!historyTagsBlackList.includes(to.path)) routerHistory.addHistory(to);
      const reLoadCache = getStorage({ name: 'reLoadFlag', debug: true });
      next();
      const performance: any = window.performance;
      let reLoadFlag = reLoadCache?.content || false;
      if (reLoadCache) {
        const lastReLoadTime = reLoadCache.dateTime;
        if (new Date().getTime() - lastReLoadTime > 10000) {
          reLoadFlag = false;
        }
      }
      // 当内存使用到一定层度后，刷新页面
      if (
        performance.memory.totalJSHeapSize / performance.memory.jsHeapSizeLimit > 0.95 &&
        !reLoadFlag
      ) {
        setStorage({ name: 'reLoadFlag', content: true });
        window.location.reload();
      }
    }
  } else {
    next({ path: '/login' });
  }
});
const isDiffAppCode = (appCode: string) => {
  const getAppInfo = getStorage({ name: APP_ID });
  return Boolean(getAppInfo == undefined && appCode) || getAppInfo?.appCode != appCode;
};
// 获取路由中的appCode 参数，设置到全局 session 中
export const setAppCode = (appCode: string) => {
  const userStore = userInfo();
  if (isDiffAppCode(appCode) && appCode) {
    const info = { appCode: appCode || '' };
    userStore.setAppInfo(info);
  }
};
router.afterEach((guard) => {
  NProgress.done();
  setAppCode(guard.meta?.appCode as string);
});

export const resetRouter = () => {
  const routers = router.getRoutes();
  const initRouteNameList: string[] = [];
  const getRootNameList = (routes: any) => {
    routes.forEach((route: any) => {
      initRouteNameList.push(route.name);
      if (route.children) {
        getRootNameList(route.children);
      }
    });
  };
  // todo 后面要调整只注册保留门户的路由不删除，其他都删除
  getRootNameList(routes);
  routers.map((route) => {
    if (!initRouteNameList.includes(route.name as string)) {
      router.removeRoute(route.name!);
    }
  });
};
export default router;

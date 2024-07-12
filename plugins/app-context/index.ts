import { App, AppContext } from 'vue';
export let appContext: AppContext;
export default (app: App) => {
  appContext = app._context;
};

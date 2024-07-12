import type { App } from 'vue';
import { elementDefaultPropsEdit } from './element-default-props-edit';
import appContext from './app-context/index';
// import clickOutside from 'vue3-clickoutside-component';
// TODO any
const plugins: any[] = [elementDefaultPropsEdit, appContext];

const install = (app: App) => {
  plugins.forEach((plugin) => {
    app.use(plugin);
  });
};

export default {
  install,
};

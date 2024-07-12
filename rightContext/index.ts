import { createApp } from 'vue';
import RightSon from './rightSon.vue';
import { documentEvent } from './documentEvent';
import { mendTreeData, getRandomId, preventDefaultFn } from './util';
export interface IMenuItem {
  label: string;
  value: string;
  key?: string;
  children?: IMenuItem[];
}
interface IOptions {
  menu: IMenuItem[]; // 本节点的菜单选项
  event?: MouseEvent; // 事件对象，用于菜单出现的位置，优先于posX和posY
  posX?: number; // 菜单的X轴位置
  posY?: number; // 菜单的Y轴位置
  nowBoxWidth?: number; // 可暴露给创建函数来定义顶层节点，或者每层节点的宽度
  canClickFather?: boolean; // 点击父级节点是否也触发事件
  canHoverOut?: boolean; // TODO 是否能悬浮在菜单之外，待完善此功能
  [x: string]: unknown;
}
const parentNode = document.createElement('div');
export const rightCtx = (options: IOptions) => {
  const sourceEvent = options.event;
  if (sourceEvent) {
    preventDefaultFn(sourceEvent);
  }
  // 处理key
  const mendedMenu = mendTreeData(options.menu, (item) => {
    item.key = item.key ? item.key : getRandomId();
    return item;
  });
  document.body.appendChild(parentNode);
  return new Promise((resolve, reject) => {
    const destoryCom = (event: Event, needReject = true) => {
      instance && instance.unmount();
      removeEvent();
      if (needReject) {
        reject(event);
      }
    };
    // 绑定全局事件
    const { addEvent, removeEvent } = documentEvent('ctx-menu-', destoryCom);
    addEvent();
    const mendedOption: IOptions = {
      menu: mendedMenu,
      posX: sourceEvent!.clientX || options.posX || 0,
      posY: sourceEvent!.clientY || options.posY || 0,
      canClickFather: options.canClickFather,
      canHoverOut: options.canHoverOut,
      absoluteX: sourceEvent!.clientX || options.posX || 0,
      nowBoxWidth: options.nowBoxWidth || 100,
      emitClick: (data: IMenuItem, event: Event) => {
        // 点击节点的回调参数
        resolve(data);
        destoryCom(event, false);
      },
    };
    mendedOption.needReverse =
      mendedOption.posX! + mendedOption.nowBoxWidth! > document.body.clientWidth - 10;
    // if (mendedOption.needReverse) {
    //   mendedOption.absoluteX = document.body.clientWidth - 10;
    // }
    // TODO 尝试只实例化一次instance
    const instance = createApp(RightSon, mendedOption);
    instance.mount(parentNode);
  });
};

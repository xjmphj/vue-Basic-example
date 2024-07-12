import { findNode } from './util';
// 标记是否绑定了全局document事件
let eventListening = false;
// 给document管理click，mousedown，mousewheel，mouseover等事件
export const documentEvent = (className: string, destoryCallBack: noop) => {
  const mouseWheelEvent = (event: Event) => {
    destoryCallBack(event);
  };
  const mouseClickEvent = (event: Event) => {
    const { flag } = findNode(event.target as HTMLElement, className);
    if (!flag) {
      destoryCallBack(event);
    }
  };
  const addEvent = () => {
    if (!eventListening) {
      document.addEventListener('click', mouseClickEvent);
      document.addEventListener('mousedown', mouseClickEvent);
      document.addEventListener('mousewheel', mouseWheelEvent);
      eventListening = true;
    }
  };
  const removeEvent = () => {
    document.removeEventListener('click', mouseClickEvent);
    document.removeEventListener('mousedown', mouseClickEvent);
    document.removeEventListener('mousewheel', mouseWheelEvent);
    eventListening = false;
  };
  return {
    addEvent,
    removeEvent,
  };
};

// 以下为工具函数
const isString = (str: any) => Object.prototype.toString.call(str) === '[object String]';
// 判断一个元素是否是在ctx菜单里面, tarNode表示目标，为LI或者UL
/**
 * 查找当前元素最近的, class中含有 className 或者 （含有className，并且节点类型为nodeName）的父级节点
 * @param el 开始查找的节点
 * @param className 父级节点含有的条件类名（支持部分类名，包含关系即可）
 * @param nodeName 节点类型条件 UL，LI，DIV等
 */
export const findNode = (el: HTMLElement, className: string, nodeName?: string) => {
  let flag = false;
  let tempEl: HTMLElement = el; // 最近一个父级节点
  while (tempEl && !flag) {
    if (
      tempEl.className &&
      isString(tempEl.className) &&
      tempEl.className.indexOf(className) !== -1 &&
      (!nodeName || nodeName === tempEl.nodeName)
    ) {
      flag = true;
    } else {
      tempEl = tempEl.parentNode as HTMLElement;
    }
  }
  return {
    flag,
    el: tempEl,
  };
};

// 获取隐藏元素的宽高
export const getHiddenEl = (el: HTMLElement) => {
  let hiddenWidth = 0,
    hiddenHeight = 0;
  if (el.style.display === 'none') {
    const baseTransform = el.style.transform;
    el.style.transform = 'translateY(-1000000px)';
    el.style.display = 'block';
    hiddenWidth = el.clientWidth;
    hiddenHeight = el.clientHeight;
    el.style.transform = baseTransform;
    el.style.display = 'none';
  } else {
    hiddenWidth = el.clientWidth;
    hiddenHeight = el.clientHeight;
  }
  return {
    hiddenWidth,
    hiddenHeight,
  };
};

/**
 * 处理树形数据，修改为前端需要的数据
 * @param treeData 树形结构数据
 * @param fn 自定义处理这个树形结构的函数
 */
export const mendTreeData = <T extends { children?: T[] }>(treeData: T[], fn: noop) => {
  const dataArray: T[] = [];
  if (treeData && treeData.length) {
    for (let i = 0; i < treeData.length; i++) {
      const itemCopy: T = fn(treeData[i]);
      if (itemCopy && itemCopy.children && itemCopy.children!.length) {
        itemCopy.children = mendTreeData(itemCopy.children, fn);
      }
      dataArray.push(itemCopy);
    }
  }
  return dataArray;
};

export const getRandomId = (length = 10) => {
  return Math.random().toFixed(length).slice(2);
};

export const preventDefaultFn = (event: Event) => {
  event.preventDefault();
};
export const stopPropagationFn = (event: Event) => {
  event.stopPropagation();
};

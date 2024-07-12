<template>
  <transition :name="isTop ? 'fade' : needReverse ? 'right-in' : 'left-in'">
    <ul
      class="ctx-menu-out"
      :style="compStyle + `width: ${isTop && nowBoxWidth ? nowBoxWidth : ''}px;`"
      :class="{ top: isTop }"
      @contextmenu="preventDefaultFn"
      ref="menuOut"
    >
      <!-- 每个右侧菜单的选项 -->
      <li
        class="ctx-menu-item"
        :class="{ active: activeIndex === item.key }"
        v-for="(item, index) in menu"
        :key="item.key"
        @mouseover="($event) => handleMouseover($event, item, index)"
        @click="($event) => handleClick(item, $event)"
      >
        <img
          :src="item.img"
          alt="logo"
          class="item-logo"
          v-if="hasImg"
          :style="`visibility: ${item.img ? '' : 'hidden'}`"
        />
        <span class="label-box">{{ item.label }}</span>
        <template v-if="item.children">
          <!-- 是否有子菜单 -->
          <svg
            class="svg-right"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            p-id="17235"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            width="24"
            height="24"
          >
            <path
              d="M332.032 171.008a28.8 28.8 0 0 0 8.96 20.992l312 320-312 320a28.8 28.8 0 0 0-8.96 20.992 28.8 28.8 0 0 0 8.96 20.992 28.8 28.8 0 0 0 20.992 8.96 30.592 30.592 0 0 0 20.992-8l331.008-340.992a29.952 29.952 0 0 0 8.96-22.016 29.952 29.952 0 0 0-8.96-22.016L382.976 148.928a30.592 30.592 0 0 0-20.992-8 30.592 30.592 0 0 0-20.992 8v0.064a32.256 32.256 0 0 0-8.96 22.016z"
              fill="#ccc"
              p-id="17236"
            />
          </svg>
          <!-- 递归本组件，产生新的子菜单，并传入新的参数（menu，posX，posY，isTop） -->
          <rightSon
            :menu="item.children"
            :emitClick="props.emitClick"
            :posX="sonPosX"
            :posY="sonPosY"
            :isTop="false"
            :needReverse="sonNeedReverse"
            :canClickFather="canClickFather"
            :absoluteX="sonAbsoluteX"
            :showFlag="activeIndex === item.key"
            v-show="activeIndex === item.key"
            @emitClick="handleClick"
          />
        </template>
      </li>
    </ul>
  </transition>
</template>
<script lang="ts" setup>
import { ref, toRefs, computed, toRef, watch, unref } from 'vue';
import { findNode, getHiddenEl, preventDefaultFn, stopPropagationFn } from './util';
import type { IMenuItem } from './index';
const props = withDefaults(
  defineProps<{
    menu: any;
    posX: number;
    posY: number;
    emitClick: noop;
    isTop?: boolean; // 当前菜单是否是顶级菜单
    needReverse?: boolean; // 当前节点是否需要反转，当在屏幕最右侧的时候，需要反转
    nowBoxWidth?: number;
    absoluteX?: number; // 当前节点的绝对位置，用于计算子节点的绝对位置
    showFlag?: boolean; // 是否展示子节点
    canClickFather?: boolean; // 是否可以点击含有子节点的节点
  }>(),
  {
    menu: [],
    event: undefined,
    isTop: true,
    needReverse: false,
    absoluteX: 0,
  }
);
const { menu, isTop, needReverse, nowBoxWidth } = toRefs(props);
const menuOut = ref();

const compStyle = computed(() => {
  let posStr = `top: ${posY.value}px;`;
  if (needReverse.value) {
    if (isTop.value) {
      posStr += `right: 10px;`;
    } else {
      // 当前节点相对于父节点的坐标，应该为当前节点UL父节点的宽度
      let parentNode = findNode(menuOut.value.parentNode, 'ctx-menu-', 'UL').el;
      posStr += `right: ${getHiddenEl(parentNode).hiddenWidth}px;`;
    }
  } else {
    posStr += `left: ${posX.value}px;`;
  }
  return posStr;
});
let posX = ref<number | undefined>(0),
  posY = ref<number | undefined>(0),
  absoluteX = ref<number | undefined>(0);
posX = toRef(props, 'posX');
posY = toRef(props, 'posY');
absoluteX = toRef(props, 'absoluteX'); // 得到当前节点的绝对坐标。，顶层节点的绝对坐标就是当前点击的位置，非顶层是通过父级计算后传值获取的
const activeIndex = ref('');
// 关闭后重置当前选中项高亮状态
watch(
  () => props.showFlag,
  (newVal) => {
    if (!newVal) {
      activeIndex.value = '';
    }
  }
);

const handleMouseover = (event: MouseEvent, item: IMenuItem, index: number) => {
  stopPropagationFn(event);
  activeIndex.value = item.key as string;
  // 如果有子项，就获取子项的位置信息
  if (item.children && item.children.length) {
    let liNode = findNode(event.target as HTMLElement, 'ctx-menu-', 'LI').el;
    let ulNode = null;
    if ((event.target as Node).nodeName === 'UL' && !isTop.value) {
      ulNode = event.target;
    } else {
      ulNode = findNode(liNode, 'ctx-menu-', 'UL').el;
    }
    ulWidth.value = (ulNode as Element).clientWidth!; // 当前UL的宽度
    if (liNode.lastElementChild && liNode.lastElementChild.nodeName === 'UL') {
      const { hiddenWidth } = getHiddenEl(liNode.lastElementChild as HTMLElement);
      if (absoluteX.value! + ulWidth.value + hiddenWidth > document.body.clientWidth - 5) {
        sonNeedReverse.value = true;
      } else {
        if (ulNode === menuOut.value) {
          sonPosX.value = ulWidth.value - 5;
        }
      }
    }
    sonAbsoluteX.value = absoluteX.value! + ulWidth.value; // 子节点的绝对坐标
    sonPosY.value = index * 32 + 5;
  }
};
const handleClick = (item: any, event: Event) => {
  stopPropagationFn(event);
  if (canClickFather || (!canClickFather && !item.children)) {
    props.emitClick(item, event);
  }
};
const hasImg = computed(() => {
  let imgIndex = menu.value.findIndex((item: any) => {
    return item.img;
  });
  return imgIndex !== -1;
});
// 子项相关信息
let sonPosX = ref(0),
  sonPosY = ref(0),
  ulWidth = ref(0),
  canClickFather = unref(props.canClickFather),
  sonAbsoluteX = ref(0);
const sonNeedReverse = ref(false); // 是否需要翻转，窗口右侧点击的时候需要
</script>
<style lang="scss" scoped>
ul,
li {
  list-style: none;
  padding: 0;
  margin: 0;
}
.ctx-menu-out {
  display: flex;
  flex-direction: column;
  background-color: rgba(255, 255, 255, 1);
  border-radius: 2px;
  position: absolute;
  padding: 8px 0;
  width: max-content;
  box-shadow: var(--box-shadow);
}
// .ctx-menu-out:not(.top) {
//   max-width: 160px;
// }
.ctx-menu-out.top {
  position: fixed;
  z-index: 1000000;
}
// .ctx-menu-out.top .ctx-menu-item {
//   width: 100%;
// }
.ctx-menu-out .ctx-menu-item {
  cursor: pointer;
  min-height: 32px;
  line-height: 32px;
  display: flex;
  align-items: center;
  padding-left: 16px;
  min-width: 80px;
  &:hover {
    color: var(--color-primary);
  }
}
.ctx-menu-out .ctx-menu-item.active {
  background-color: #e8f3ff;
  color: var(--color-primary);
}
.ctx-menu-out .ctx-menu-item .label-box {
  flex-grow: 1;
  font-size: 12px;
}
.ctx-menu-out .ctx-menu-item .svg-right {
  flex-shrink: 0;
}
.item-logo {
  width: 24px;
  height: 24px;
  margin-right: 5px;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
.left-in-enter-active,
.right-in-enter-active {
  transition: all ease-out 0.3s;
}
.left-in-leave-active,
.right-in-leave-active {
  display: none;
}
.left-in-enter-from {
  transform: translateX(-20px);
}
.right-in-enter-from {
  transform: translateX(20px);
}
</style>

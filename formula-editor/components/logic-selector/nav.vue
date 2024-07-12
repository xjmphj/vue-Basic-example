<template>
  <ul class="nav">
    <li
      v-for="item in navList"
      class="nav-item"
      :key="item.value"
      :class="[{ active: currentNav === item.value }, { 'only-one-item': navList.length == 1 }]"
      @click="changeNav(item.value)"
    >
      {{ item.label }}
    </li>
  </ul>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';

const props = defineProps<{
  navList: Array<{ label: any; value: any }>;
  current: any;
}>();
const emits = defineEmits<{
  (e: 'update:current', val: any): void;
  (e: 'change', val: any): void;
}>();
const { navList } = toRefs(props);
const currentNav = computed({
  get() {
    return props.current;
  },
  set(val: any) {
    emits('update:current', val);
  },
});
const changeNav = (val: any) => {
  if (val === currentNav.value) {
    return;
  }
  currentNav.value = val;
  emits('change', val);
};
</script>

<style scoped lang="scss">
.nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid var(--border-color-3);
  border-bottom: none;
  height: 32px;
  .nav-item {
    cursor: pointer;
    box-sizing: border-box;
    height: 32px;
    flex: 1 0 0;
    background-color: var(--fill-color-lighten);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    color: var(--text-6);
    border-bottom: 1px solid var(--border-color-3);
    &:not(:first-child) {
      border-left: 1px solid var(--border-color-3);
    }

    &:hover {
      color: var(--color-primary);
    }
    &.active {
      color: var(--color-primary);
      border-bottom-color: transparent;
      background-color: #fff;
      position: relative;
      &::after {
        position: absolute;
        content: '';
        display: block;
        width: 100%;
        height: 3px;
        top: -1px;
        left: 0;
        background-color: var(--color-primary);
      }
      &.only-one-item {
        text-align: left;
        display: inline-block;
        line-height: 32px;
        padding-left: 20px;
        color: var(--text-6);
        background: var(--fill-color);
        opacity: 1;
        border-bottom: 1px solid var(--border-color-3);
        &::after {
          height: 0;
        }
      }
    }
  }
}
</style>

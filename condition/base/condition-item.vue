<template>
  <div class="condition-list">
    <div v-for="(item, index) in parentData" :key="index" class="condition-item">
      <div class="content">
        <slot
          :parent-data="parentData"
          :parent-index="parentIndex"
          :data="item"
          :index="index"
          :genProp="genProp(index, parentIndex)"
        />
      </div>
      <div class="button-box">
        <svg-icon
          name="DesignCopy"
          :size="14"
          class="icon"
          :class="{ disabled: disabled }"
          @click="copyFn(item, index)"
          >复制</svg-icon
        >
        <svg-icon
          name="delete"
          :size="14"
          color="#1D2129"
          class="icon"
          :class="{ disabled: disabled }"
          @click="delFn(index)"
          >删除</svg-icon
        >
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import _cloneDeep from 'lodash/cloneDeep';
import { confirmBox } from '@/utils';
const props = defineProps<{
  index: number;
  data: Array<any>;
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (e: 'emptyDel'): void;
}>();
const { data: parentData, index: parentIndex, disabled } = toRefs(props);
const copyFn = (item: any, index: number) => {
  if (disabled?.value) return;
  const copied = _cloneDeep(item);
  parentData.value.splice(index + 1, 0, copied);
};
const delFn = async (index: number) => {
  if (disabled?.value) return;
  const flag = await confirmBox('确认删除？');
  if (flag) {
    parentData.value.splice(index, 1);
    !parentData.value.length && emits('emptyDel');
  }
};
const genProp = (index: number, pIndex: number) => {
  return (prop: string) => {
    return `conditionGroup[${pIndex}].conditionList.${index}.${prop}`;
  };
};
</script>

<style scoped lang="scss">
.condition-item {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .content {
    flex: 1 0 0;
    overflow: hidden;
  }
  .button-box {
    height: 100%;
    width: 58px;
    box-sizing: border-box;
    padding-left: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-bottom: 12px;
    .icon {
      cursor: pointer;
      float: left;
      margin-right: 6px;
      &:last-child {
        margin-right: 0;
      }
      &.disabled {
        cursor: not-allowed;
      }
    }
  }
  &:hover {
    .button-box {
      .icon {
        display: block;
      }
    }
  }
}
</style>

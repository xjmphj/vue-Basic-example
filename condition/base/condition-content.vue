<template>
  <el-form v-if="condition" ref="formRef" :model="condition" :disabled="disabled">
    <template v-for="(item, index) in condition.conditionGroup" v-bind:key="index">
      <div class="condition-box">
        <div class="operation-box">
          <logic-symbol-select v-model="item.combinator" />
          <div class="icon-box">
            <svg-icon
              name="DesignCopy"
              :size="14"
              class="icon"
              :class="{ disabled: disabled }"
              @click="copyGroupFn(item, index)"
            />
            <svg-icon
              name="delete"
              :size="14"
              color="#1D2129"
              class="icon"
              @click="delGroupFn(index)"
            />
          </div>
        </div>
        <condition-item
          :index="index"
          :data="item.conditionList"
          :disabled="disabled"
          @emptyDel="delGroupFn(index, true)"
        >
          <template #default="scope">
            <slot v-bind="scope" />
          </template>
        </condition-item>
        <div class="add-box" @click="addConditionFn(index)">
          <el-icon :size="12" class="no-inherit">
            <Plus />
          </el-icon>
          <el-button link type="primary">添加条件</el-button>
        </div>
      </div>
      <div class="bottom-line"></div>
    </template>

    <el-button type="primary" icon="plus" class="add-group-btn" @click="addGroupFn"
      >添加条件组</el-button
    >
  </el-form>
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import {
  ICondition,
  IConditionItem,
  OperatorTypeEnum,
  combinatorType,
  conditionItemInitial,
} from '../../expression-common';
import ConditionItem from './condition-item.vue';
import _cloneDeep from 'lodash/cloneDeep';
import { confirmBox } from '@/utils';
import { FormInstance } from 'element-plus';
import LogicSymbolSelect from './logic-symbol-select.vue';
const props = defineProps<{
  modelValue?: ICondition | null;
  initData?: Function;
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', data: ICondition): void;
}>();
const formRef = ref<FormInstance>();
const { modelValue: condition, initData, disabled } = toRefs(props);
const init = () => {
  if (!condition?.value) {
    const initCondition: ICondition = {
      combinator: combinatorType.or,
      conditionGroup: [],
    };
    const group = conditionItemInitial();
    const item =
      typeof initData?.value === 'function'
        ? initData.value()
        : {
            leftExpr: {},
            operator: OperatorTypeEnum.eq,
            rightExpr: {},
          };
    group.conditionList.push(item);
    initCondition.conditionGroup.push(group);
    emits('update:modelValue', initCondition);
  }
};
init();

const addGroupFn = () => {
  const data = conditionItemInitial();
  const item =
    typeof initData?.value === 'function'
      ? initData.value()
      : {
          leftExpr: {},
          operator: OperatorTypeEnum.eq,
          rightExpr: {},
        };
  data.conditionList.push(item);
  condition?.value?.conditionGroup.push(data);
};
const addConditionFn = (index: number) => {
  const data =
    typeof initData?.value === 'function'
      ? initData.value()
      : {
          leftExpr: {},
          operator: OperatorTypeEnum.eq,
          rightExpr: {},
        };
  condition?.value?.conditionGroup[index].conditionList.push(data);
};
const copyGroupFn = (data: IConditionItem, index: number) => {
  if (disabled?.value) return;
  condition?.value?.conditionGroup.splice(index, 0, _cloneDeep(data));
};
const delGroupFn = async (index: number, isNoConfirm?: boolean) => {
  if (disabled?.value) return;
  if (isNoConfirm) return condition?.value?.conditionGroup.splice(index, 1);
  // 先确认
  const flag = await confirmBox('确认删除？');
  if (flag) {
    condition?.value?.conditionGroup.splice(index, 1);
  }
};
defineExpose({
  formInstance: formRef,
});
</script>

<style scoped lang="scss">
.condition-box {
  position: relative;
  padding: 8px 8px 12px 12px;
  border-radius: 4px;
  .operation-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 8px;
    .icon-box {
      width: 49px;
      height: 24px;
      display: none;
      top: 8px;
      right: 8px;
      background: #ffffff;
      box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.12);
      border-radius: 4px;
      display: none;
      .icon {
        height: 100%;
        flex: 1 0 0;
        box-sizing: border-box;
        cursor: pointer;
        &:not(:last-child) {
          border-right: 1px solid #f2f3f5;
        }
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
  }

  &:hover {
    background: #f2f4fa;
    .operation-box {
      .icon-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
    }
  }
}

.add-box {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-inherit {
  color: var(--color-primary);
}
.bottom-line {
  height: 0;
  border-top: 1px solid #e5e6eb;
  margin-bottom: 8px;
}
.add-group-btn {
  margin-top: 4px;
}
</style>

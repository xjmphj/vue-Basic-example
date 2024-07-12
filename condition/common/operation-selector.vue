<template>
  <el-form-item :prop="prop" label="" :rules="rules || originRules">
    <el-select
      v-model="value"
      placeholder="请选择"
      @change="(val:IValue)=>emits('change',val|| null)"
      clearable
    >
      <el-option
        v-for="operatorItem in getAllowOperatorList()"
        :key="operatorItem.value"
        :label="operatorItem.label"
        :value="operatorItem.value"
      />
    </el-select>
  </el-form-item>
</template>

<script setup lang="ts">
import cloneDeep from 'lodash/cloneDeep';
import { FormItemRule } from 'element-plus';
import {
  OperatorTypeEnum,
  operatorTypeList as s_operatorTypeList,
  addNewOperatorTypeList,
  componentOperateConfig,
  operatorScopeType,
} from '../../expression-common/index';
import { computed, toRefs } from 'vue';
type IValue = OperatorTypeEnum | null;
const props = defineProps<{
  prop?: string;
  rules?: FormItemRule[];
  leftExpr?: any; //是否根据左侧字段显示对应的操作符范围，需要则传入leftExpr
  modelValue: IValue;
  scopeType?: operatorScopeType;
}>();

const { prop, rules, modelValue, scopeType } = toRefs(props);
const emits = defineEmits<{
  (e: 'update:modelValue', val: IValue): void;
  (e: 'change', val: IValue): void;
}>();

const originRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
  },
];
const getAllowOperatorList = () => {
  const operatorTypeList = cloneDeep(s_operatorTypeList);
  operatorTypeList.splice(
    -2,
    0,
    ...addNewOperatorTypeList.filter((v) => scopeType?.value && v.scope.includes(scopeType?.value))
  );
  if (props?.leftExpr) {
    const { fieldType, fieldCode } = props.leftExpr;
    if (fieldType && fieldCode != 'id') {
      return operatorTypeList.filter((opItem: any) =>
        componentOperateConfig[fieldType]?.includes(opItem.label)
      );
    } else if (fieldType && fieldCode == 'id') {
      // 记录标识的操作符
      return operatorTypeList.filter((opItem: any) =>
        componentOperateConfig['id'].includes(opItem.label)
      );
    } else {
      return operatorTypeList;
    }
  } else {
    return operatorTypeList;
  }
};

const value = computed({
  get() {
    return modelValue.value as any;
  },
  set(val: any | IValue) {
    emits('update:modelValue', val || null);
  },
});
defineOptions({
  name: 'operation-selector',
});
</script>

<style scoped lang="scss"></style>

<template>
  <el-form-item :prop="prop" label="" :rules="rules || originRules">
    <el-select
      v-model="value"
      placeholder="请选择"
      @change="(val:IValue)=>emits('change',val|| null)"
      clearable
      :disabled="disabled"
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
import { FormItemRule } from 'element-plus';
import {
  OperatorTypeEnum,
  operatorTypeList as s_operatorTypeList,
  boolOperatorTypeList,
  operatorScopeType,
} from '../../expression-common/index';
import { computed, toRefs } from 'vue';
type IValue = OperatorTypeEnum | null;
const props = defineProps<{
  prop?: string;
  rules?: FormItemRule[];
  leftExpr?: any; // 可能为对象
  modelValue: IValue;
  disabled?: boolean;
}>();

const { prop, rules, modelValue } = toRefs(props);
const disabled = computed(() => props.disabled || false);
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
  // 根据类型配置不同的操作符
  const typeForOperatorList = {
    string: ['=', '!=', '为空', '不为空'],
    integer: ['=', '!=', '为空', '不为空'],
    number: ['=', '!=', '为空', '不为空'],
    boolean: ['=', '!=', '为空', '不为空', '为true', '为false'],
    array: ['为空', '不为空'],
    object: ['为空', '不为空'],
  };

  const operatorTypeList = s_operatorTypeList
    .concat(boolOperatorTypeList)
    .filter((item) => item.scope?.includes(operatorScopeType.interfaceRuleFilter));

  if (props?.leftExpr.type) {
    return operatorTypeList.filter((opItem: any) =>
      typeForOperatorList[props?.leftExpr.type]?.includes(opItem.label)
    );
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

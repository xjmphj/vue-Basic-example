<template>
  <el-form-item :prop="prop" :rules="rules">
    <el-select v-model="value" placeholder="请选择" @change="(val:valueType)=>emits('change',val)">
      <el-option
        v-for="item in options"
        :key="item.value"
        :label="item.label"
        :value="item.value"
      />
    </el-select>
  </el-form-item>
</template>
<script setup lang="ts">
import { toRefs, computed } from 'vue';
import { FormItemRule } from 'element-plus';
import { valueTypeList, OperationSide, valueType } from '@/components/expression-common';
import { ICascadeItem } from '@/api/convert-rules/type';
import { ConditionItemChild } from '@/components/expression-common';
import { isModelFn, isDictFn } from '@/utils/utils';

const props = defineProps<{
  prop: string;
  operationSide: OperationSide;
  rules?: FormItemRule[];
  modelValue: valueType;
  data: ConditionItemChild<ICascadeItem, any>;
}>();
const SideMap = {
  [OperationSide.left]: computed(() => [valueType.field]),
  [OperationSide.right]: computed(() =>
    isModelFn(data.value.leftExpr) || isDictFn(data.value.leftExpr)
      ? [valueType.option, valueType.constant]
      : [valueType.constant]
  ),
};
const emits = defineEmits<{
  (e: 'update:modelValue', val: valueType): void;
  (e: 'change', val: valueType): void;
}>();
const { operationSide, rules, prop, modelValue, data } = toRefs(props);

const options = computed(() =>
  valueTypeList.filter((v) =>
    SideMap[operationSide.value || OperationSide.left].value.includes(v.value)
  )
);
const value = computed<valueType>({
  get() {
    return modelValue.value;
  },
  set(val: valueType) {
    emits('update:modelValue', val);
  },
});
</script>
<style scoped></style>

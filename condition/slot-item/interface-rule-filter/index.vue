<template>
  <three-template>
    <template #first>
      <interface-path-selector
        :data="interfaceData"
        :modelValue="data.leftExpr"
        :prop="genProp('leftExpr.path')"
        @update:modelValue="changeLeftExpr"
        :disabled="disabled"
      />
    </template>
    <template #second>
      <interface-operation-selector
        v-model="data.operator"
        :leftExpr="data.leftExpr"
        :prop="genProp('operator')"
        @change="onOperationChange"
        :disabled="disabled"
      />
    </template>
    <template #third>
      <formula-edit
        v-if="!hideRight"
        v-model="data.rightExpr"
        :category="category"
        :fieldParams="customParams"
        :prop="genProp('rightExpr')"
        :rules="fxRules"
        :disabled="disabled"
      />
    </template>
  </three-template>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import InterfaceOperationSelector from '../../common/interface-operation-selector.vue';
import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FormulaEdit from '../../common/formula.vue';
import { ILogicFields } from '@/components/formula-editor/types';
import ThreeTemplate from '../../layout-template/three-template.vue';
import { functionCategory } from '@/api/convert-rules/type';
import InterfacePathSelector from '../../common/interface-path-selector.vue';
import { IInterfaceConfig, initData } from './util';
import { FormItemRule } from 'element-plus';

const props = defineProps<{
  parentData: Array<ConditionItemChild<IInterfaceConfig, IExpression>>;
  parentIndex: number;
  index: number;
  data: ConditionItemChild<IInterfaceConfig, string>;
  customParams: ILogicFields;
  category: functionCategory;
  interfaceData: any[];
  genProp: (val: string) => string;
  disabled?: boolean;
}>();
const { data, customParams, genProp, interfaceData } = toRefs(props);
const disabled = computed(() => props.disabled || false);
const onOperationChange = (val: OperatorTypeEnum | null) => {
  if (
    val &&
    [
      OperatorTypeEnum.isNull,
      OperatorTypeEnum.notNull,
      OperatorTypeEnum.isTrue,
      OperatorTypeEnum.isFalse,
    ].includes(val)
  ) {
    data.value.rightExpr = initData().rightExpr;
  }
};
const hideRight = computed(() => {
  return (
    data.value.operator &&
    [
      OperatorTypeEnum.isNull,
      OperatorTypeEnum.notNull,
      OperatorTypeEnum.isTrue,
      OperatorTypeEnum.isFalse,
    ].includes(data.value.operator)
  );
});

const changeLeftExpr = (valData) => {
  if (valData.path !== data.value.leftExpr.path) {
    const initDataNew = initData();
    data.value.leftExpr = valData;
    data.value.operator = initDataNew.operator;
    data.value.rightExpr = initDataNew.rightExpr;
  }
};

const fxRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
    type: 'string',
    validator(rule, value, callback) {
      if (value) {
        const needValue = JSON.parse(value);
        if (needValue.elements.length == 0) {
          callback(new Error('不能为空'));
        } else {
          callback();
        }
      } else {
        callback(new Error('不能为空'));
      }
    },
  },
];
</script>

<style scoped lang="scss"></style>

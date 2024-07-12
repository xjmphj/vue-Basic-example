<template>
  <Five-template>
    <template #first>
      <optionsClassify
        v-model="leftSideType"
        :data="data"
        :operationSide="OperationSide.left"
        :prop="genProp('leftExpr.type')"
      />
    </template>
    <template #second>
      <field-cascade
        :data="data"
        :modelCodeList="modelCodeList"
        :prop="genProp('leftExpr.unionCode')"
        @changeFieldCode="resetData"
      />
    </template>
    <template #third>
      <operation-selector
        v-model="data.operator"
        :leftExpr="data?.leftExpr"
        :prop="genProp('operator')"
        @change="onOperationChange"
      />
    </template>
    <template #four>
      <optionsClassify
        v-if="![OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(data.operator as any ?? '')"
        v-model="rightSideType"
        :data="data"
        :operationSide="OperationSide.right"
        :prop="genProp('rightExpr.type')"
      />
    </template>
    <template #five>
      <optionVue
        v-if="rightSideType === valueType.option"
        :data="data"
        :prop="genProp('leftExpr.unionCode')"
      />
      <formula-edit
        v-if="!hideRight && rightSideType === valueType.constant"
        v-model="data.rightExpr.formulaConfig"
        :category="6"
        :fieldParams="customParams"
        :prop="genProp('rightExpr.formulaConfig')"
      />
    </template>
  </Five-template>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import optionVue from '../../common/option-vue.vue';
import FieldCascade from '../../common/field-cascade.vue';
import optionsClassify from '../../common/options-classify.vue';
import OperationSelector from '../../common/operation-selector.vue';
import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common/index';
import { ICascadeItem, RightExprType } from '@/api/convert-rules/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FormulaEdit from '../../common/formula.vue';
import { IPageFields } from '@/components/formula-editor/types';
import { IModelCodeItem } from '@/views/convert-rules/components/input-condition';
import FiveTemplate from '../../layout-template/five-template.vue';
import { OperationSide, valueType } from '@/components/expression-common';

const props = defineProps<{
  parentData: Array<ConditionItemChild<ICascadeItem, IExpression>>;
  parentIndex: number;
  data: ConditionItemChild<ICascadeItem, RightExprType>;
  index: number;
  modelCodeList: IModelCodeItem[];
  customParams: IPageFields;
  genProp: (val: string) => string;
}>();
const { data, modelCodeList, customParams, genProp } = toRefs(props);
const onOperationChange = (val: OperatorTypeEnum | null) => {
  if (val && [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(val)) {
    data.value.rightExpr.formulaConfig = [];
  }
};
const hideRight = computed(() => {
  return (
    data.value.operator &&
    [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(data.value.operator)
  );
});
const leftSideType = computed({
  get() {
    return data.value.leftExpr.type as valueType;
  },
  set(val: valueType) {
    data.value.leftExpr.type = val;
  },
});
const rightSideType = computed({
  get() {
    return (data.value.rightExpr as any)?.type as valueType;
  },
  set(val: valueType) {
    if (!(data.value.rightExpr as any).type)
      return ((data.value.rightExpr as any) = { type: val, unionCode: '', formulaConfig: [] });
    (data.value.rightExpr as any).type = val;
    if (val === valueType.constant) data.value.rightExpr.formulaConfig = [];
  },
});
// watch(
//   () => data.value.leftExpr.unionCode,
//   () => {
//     // console.log('data.value.leftExpr', data.value);
//     resetData();
//   },
//   {
//     deep: true,
//   }
// );
const resetData = () => {
  data.value.operator = null;
  data.value.rightExpr = { type: undefined, unionCode: '', formulaConfig: [] };
};
</script>

<style scoped lang="scss"></style>

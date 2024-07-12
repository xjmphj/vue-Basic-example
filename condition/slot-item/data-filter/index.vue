<template>
  <three-template>
    <template #first>
      <field-cascade
        :data="data"
        :modelCodeList="modelCodeList"
        :prop="genProp('leftExpr.unionCode')"
      />
    </template>
    <template #second>
      <operation-selector
        v-model="data.operator"
        :prop="genProp('operator')"
        :leftExpr="data.leftExpr"
        :scope-type="operatorScopeType.customModelFilter"
        @change="onOperationChange"
      />
    </template>
    <template #third>
      <formula-edit
        v-if="!hideRight"
        v-model="data.rightExpr"
        :category="category"
        :fieldParams="customParams"
        :prop="genProp('rightExpr')"
      />
    </template>
  </three-template>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import FieldCascade from '../../common/field-cascade.vue';
import OperationSelector from '../../common/operation-selector.vue';
import {
  ConditionItemChild,
  OperatorTypeEnum,
  operatorScopeType,
} from '@/components/expression-common';
import { ICascadeItem, functionCategory } from '@/api/convert-rules/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FormulaEdit from '../../common/formula.vue';
import { ICustomFields, IPageFields } from '@/components/formula-editor/types';
import { IModelCodeItem } from '@/views/convert-rules/components/input-condition';
import ThreeTemplate from '../../layout-template/three-template.vue';
const props = defineProps<{
  parentData: Array<ConditionItemChild<ICascadeItem, IExpression>>;
  parentIndex: number;
  data: ConditionItemChild<ICascadeItem, IExpression>;
  index: number;
  modelCodeList: IModelCodeItem[];
  customParams: IPageFields | ICustomFields;
  category?: functionCategory;
  genProp: (val: string) => string;
}>();
const { data, modelCodeList, customParams, genProp } = toRefs(props);
const category = computed(() => {
  return props.category ? props.category : 6;
});
const onOperationChange = (val: OperatorTypeEnum | null) => {
  if (val && [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(val)) {
    data.value.rightExpr = [];
  }
};
const hideRight = computed(() => {
  return (
    data.value.operator &&
    [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(data.value.operator)
  );
});
// const fieldParams = computed<IPageFields>(() => {
//   return {
//     type: FiledTypeEnum.page,
//     params: customParams.value,
//   };
// });
</script>

<style scoped lang="scss"></style>

<template>
  <three-template>
    <template #first>
      <formula-edit
        v-model="data.leftExpr"
        :category="category"
        :fieldParams="customParams"
        :prop="genProp('leftExpr')"
      />
    </template>
    <template #second>
      <operation-selector
        v-model="data.operator"
        :prop="genProp('operator')"
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
import OperationSelector from '../../common/operation-selector.vue';
import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FormulaEdit from '../../common/formula.vue';
import { ICustomFields, IPageFields } from '@/components/formula-editor/types';
import ThreeTemplate from '../../layout-template/three-template.vue';
import { functionCategory } from '@/api/convert-rules/type';
const props = defineProps<{
  parentData: Array<ConditionItemChild<IExpression, IExpression>>;
  parentIndex: number;
  data: ConditionItemChild<IExpression, IExpression>;
  index: number;
  customParams: ICustomFields | IPageFields;
  category: functionCategory;
  genProp: (val: string) => string;
}>();
const { data, customParams, genProp } = toRefs(props);
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
</script>

<style scoped lang="scss"></style>

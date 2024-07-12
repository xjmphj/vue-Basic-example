<template>
  <reference-base :initData="initData" v-model="value" v-bind="$attrs">
    <template #reference="scope">
      <slot name="reference" v-bind="scope"></slot>
    </template>
    <template #="scope">
      <data-filter-slot
        v-bind="scope"
        :custom-params="fieldParams"
        :modelCodeList="modelCodeList"
        :category="props.category"
      />
    </template>
  </reference-base>
</template>

<script setup lang="ts">
import { ICustomFields, IPageFields } from '@/components/formula-editor/types';
import ReferenceBase from '../../base/condition-reference.vue';
import DataFilterSlot from '../../slot-item/data-filter/index.vue';
import { computed, toRefs } from 'vue';
import { IModelCodeItem } from '@/views/convert-rules/components/input-condition';
import { initData } from '../../slot-item/data-filter/util';
import { ConditionItemChild, ICondition } from '../../../expression-common';
import { ICascadeItem, functionCategory } from '@/api/convert-rules/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';
const props = defineProps<{
  modelValue: ICondition<ConditionItemChild<ICascadeItem, IExpression>>;
  fieldParams: IPageFields | ICustomFields;
  modelCodeList: IModelCodeItem[];
  category?: functionCategory;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: ICondition<ConditionItemChild<ICascadeItem, IExpression>>): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: ICondition<ConditionItemChild<ICascadeItem, IExpression>>) {
    emits('update:modelValue', val);
  },
});
const { fieldParams, modelCodeList } = toRefs(props);
defineOptions({
  name: 'data-filter-reference',
});
</script>

<style scoped lang="scss"></style>

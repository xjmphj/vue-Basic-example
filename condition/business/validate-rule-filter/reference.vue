<template>
  <reference-base :initData="initData" v-model="value" v-bind="$attrs" title="条件表达式">
    <template #reference="scope">
      <slot name="reference" v-bind="scope"></slot>
    </template>
    <template #="scope">
      <validate-rule-filter-slot v-bind="scope" :custom-params="fieldParams" :category="category" />
    </template>
  </reference-base>
</template>

<script setup lang="ts">
import { ICustomFields } from '@/components/formula-editor/types';
import ReferenceBase from '../../base/condition-reference.vue';
import validateRuleFilterSlot from '../../slot-item/validate-rule-filter/index.vue';
import { computed, toRefs } from 'vue';
import { initData } from '../../slot-item/validate-rule-filter/util';
import { ConditionItemChild, ICondition } from '../../../expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import { functionCategory } from '@/api/convert-rules/type';
const props = defineProps<{
  modelValue: ICondition<ConditionItemChild<IExpression, IExpression>>;
  fieldParams: ICustomFields;
  category: functionCategory;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: ICondition<ConditionItemChild<IExpression, IExpression>>): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: ICondition<ConditionItemChild<IExpression, IExpression>>) {
    emits('update:modelValue', val);
  },
});
const { fieldParams } = toRefs(props);
defineOptions({
  name: 'validate-rule-filter-reference',
});
</script>

<style scoped lang="scss"></style>

<template>
  <reference-base
    :initData="initData"
    v-model="value"
    v-bind="$attrs"
    title="条件表达式"
    :disabled="disabled"
  >
    <template #reference="scope">
      <slot name="reference" v-bind="scope"></slot>
    </template>
    <template #="scope">
      <interface-rule-filter-slot
        v-bind="scope"
        :custom-params="fieldParams"
        :category="category"
        :interfaceData="interfaceData"
        :disabled="disabled"
      />
    </template>
  </reference-base>
</template>

<script setup lang="ts">
import { ILogicFields } from '@/components/formula-editor/types';
import ReferenceBase from '../../base/condition-reference.vue';
import InterfaceRuleFilterSlot from '../../slot-item/interface-rule-filter/index.vue';
import { computed, toRefs } from 'vue';
import { IInterfaceConfig, initData } from '../../slot-item/interface-rule-filter/util';
import { ConditionItemChild, ICondition } from '../../../expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import { functionCategory } from '@/api/convert-rules/type';

const props = defineProps<{
  modelValue: ICondition<ConditionItemChild<IInterfaceConfig, IExpression>>;
  fieldParams: ILogicFields;
  category: functionCategory;
  interfaceData: any[];
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (
    e: 'update:modelValue',
    val: ICondition<ConditionItemChild<IInterfaceConfig, IExpression>>
  ): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: ICondition<ConditionItemChild<IInterfaceConfig, IExpression>>) {
    emits('update:modelValue', val);
  },
});
const { fieldParams } = toRefs(props);
const disabled = computed(() => props.disabled || false);
defineOptions({
  name: 'interface-rule-filter-reference',
});
</script>

<style scoped lang="scss"></style>

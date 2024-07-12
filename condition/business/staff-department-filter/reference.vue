<template>
  <reference-base :initData="initData" v-model="value">
    <template #reference="scope">
      <slot name="reference" v-bind="scope"></slot>
    </template>
    <template #="scope">
      <staff-filter-slot v-bind="scope" :custom-params="fieldParams" :type="type" />
    </template>
  </reference-base>
</template>

<script setup lang="ts">
import { IPageFields } from '@/components/formula-editor/types';
import ReferenceBase from '../../base/condition-reference.vue';
// import DataFilterSlot from '../../slot-item/data-filter/index.vue';
import { computed, toRefs } from 'vue';
import { initData } from '../../slot-item/data-filter/util';
import { ConditionItemChild, ICondition } from '../../../expression-common';
import { ICascadeItem } from '@/api/convert-rules/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import StaffFilterSlot from '../../slot-item/staff-department-filter/index.vue';
import { DepartmentTypeEnum } from '@/api/custom-page/type';
const props = defineProps<{
  modelValue: ICondition<ConditionItemChild<ICascadeItem, IExpression>> | null;
  fieldParams: IPageFields;
  type: DepartmentTypeEnum;
}>();
const emits = defineEmits<{
  (
    e: 'update:modelValue',
    val: ICondition<ConditionItemChild<ICascadeItem, IExpression>> | null
  ): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: ICondition<ConditionItemChild<ICascadeItem, IExpression>> | null) {
    emits('update:modelValue', val);
  },
});
const { fieldParams, type } = toRefs(props);
defineOptions({
  name: 'data-filter-reference',
});
</script>

<style scoped lang="scss"></style>

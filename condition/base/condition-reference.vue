<template>
  <slot name="reference" :open="open" :disabled="disabled"></slot>
  <condition-dialog
    v-if="visible"
    v-model:visible="visible"
    :title="title"
    :title-edit="titleEdit"
    :condition="modelValue"
    :initData="initData"
    :disabled="disabled"
    @ensure="ensure"
    v-bind="$attrs"
  >
    <template #default="scope">
      <slot v-bind="scope" />
    </template>
  </condition-dialog>
</template>

<script setup lang="ts">
import { ICondition } from '../../expression-common';
import ConditionDialog from './condition-dialog.vue';
import { ref, toRefs } from 'vue';
const props = withDefaults(
  defineProps<{
    modelValue?: ICondition | null;
    titleEdit?: boolean;
    title?: string;
    initData?: Function;
    disabled?: boolean;
  }>(),
  { titleEdit: false }
);
const emits = defineEmits<{
  (e: 'update:modelValue', data: ICondition | null): void;
}>();
const { title, titleEdit, modelValue, initData, disabled } = toRefs(props);

const open = () => {
  visible.value = true;
};
const visible = ref<boolean>(false);
const ensure = (val: ICondition | null) => {
  emits('update:modelValue', val);
};
defineOptions({
  name: 'condition',
});
</script>

<style scoped lang="scss"></style>

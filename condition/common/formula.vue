<template>
  <el-form-item :prop="prop" label="" :rules="rules || originRules">
    <formulaReference
      :category="category"
      v-model:formulaConfig="value"
      :fieldParams="fieldParams"
      :disabled="disabled"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { FieldParams } from '@/components/formula-editor/types';
import { computed, toRefs } from 'vue';
import { FormItemRule } from 'element-plus';
import formulaReference from '@/components/formula-editor/reference.vue';
import { functionCategory } from '@/api/convert-rules/type';

const props = defineProps<{
  prop?: string;
  rules?: FormItemRule[];
  modelValue: any;
  category: functionCategory;
  fieldParams: FieldParams;
  disabled?: boolean;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void;
}>();
const { prop, rules, category, fieldParams } = toRefs(props);
const disabled = computed(() => props.disabled || false);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: any) {
    emits('update:modelValue', val);
  },
});
const originRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
    type: 'array',
  },
];
defineOptions({
  name: 'formula',
});
</script>

<style scoped lang="scss"></style>

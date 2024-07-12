<template>
  <slot name="reference" :open="open" :label="textLabel" :disabled="disabled"></slot>
  <template v-if="!$slots.reference">
    <div
      class="el-input el-input--default formula-input"
      :class="{ 'is-disabled': disabled }"
      @click="disabled ? '' : openEvent()"
    >
      <div class="el-input__wrapper" :class="disabled ? 'disabled' : ''">
        <div class="el-input__inner">
          <div class="value-content" v-text-overflow="{ maxWidth: 300 }">{{ textLabel }}</div>
          <svg-icon name="fx" :size="16" class="cursor-pointer fx-icon" />
        </div>
      </div>
    </div>
  </template>

  <formula-dialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    :functions="functionList"
    :ensure-close-dialog="ensureCloseDialog"
    :title="title"
    :fieldParams="fieldParams"
    :required="required"
    :updatedFormulaConfig="formulaValue"
    @ensure="onEnsure"
  />
</template>
<script setup lang="ts">
import { useDialog } from '@/utils/hooks/use-dialog';
import FormulaDialog from './formula-dialog-v2.vue';
import type { functionCategory } from '@/api/convert-rules/type';
import { getFunctionList, handleFunctionList } from './hooks/use-functions';
import { computed, inject, toRefs, useSlots, nextTick } from 'vue';
import { FieldParams, FormulaValueType } from './types/index';
import { preProcessValue, processValue } from './hooks/use-formula-config-v2';
import { formContextKey, useFormItem } from 'element-plus';
import { debugWarn } from 'element-plus/es/utils/error';
import { filedLabelProcessMap } from './utils/label-process';
const { formItem } = useFormItem();
const props = withDefaults(
  defineProps<{
    category: functionCategory;
    ensureCloseDialog?: boolean;
    title?: string;
    fieldParams: FieldParams;
    formulaConfig: FormulaValueType | null | undefined;
    required?: boolean;
    disabled?: boolean;
  }>(),
  { ensureCloseDialog: true, disabled: false, required: false }
);
const emits = defineEmits<{
  (e: 'update:formulaConfig', config: FormulaValueType): void;
  (e: 'open'): void;
  (e: 'updateLabel', label: string): void;
}>();
const $slots = useSlots();
const form = inject(formContextKey, undefined);
const { category, fieldParams, formulaConfig, disabled: inputDisabled } = toRefs(props);
const { visible: dialogVisible, open } = useDialog();
const disabled = computed(() => inputDisabled.value || form?.disabled || false);
const { functionList } = getFunctionList(category.value);
const { functionValueMap } = handleFunctionList(functionList);

// 原始值格式转化为编辑器需要的格式
const formulaValue = processValue(preProcessValue(formulaConfig, fieldParams), {
  functionValueMap,
});

// label的获取
const textLabel = computed(() => {
  return (
    formulaValue.value
      .map((o) => {
        if (typeof filedLabelProcessMap[o.type] === 'function') {
          return filedLabelProcessMap[o.type](o);
        } else {
          return o.label;
        }
      })
      .join('') ?? ''
  );
});

const onEnsure = (value: FormulaValueType) => {
  emits('update:formulaConfig', value);
  nextTick(() => emits('updateLabel', textLabel.value));
  formItem?.validate?.('change').catch((err) => debugWarn(err));
  formItem?.validate?.('blur').catch((err) => debugWarn(err));
};

const openEvent = () => {
  emits('open');
  open();
};
defineOptions({
  name: 'expression-editor',
});
</script>

<style scoped lang="scss">
.formula-input {
  &.el-input {
    width: 100%;
    display: block;
    .el-input__wrapper {
      display: block;
      &.disabled {
        background-color: var(--el-disabled-bg-color);
        // box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
        box-shadow: 0 0 0 1px var(--el-input-border-color, var(--el-border-color)) inset;
        cursor: not-allowed;
        .el-input__inner {
          color: var(--el-disabled-text-color);
          cursor: not-allowed;
        }
      }
    }
    .el-input__inner {
      cursor: pointer;
      user-select: none;
      position: relative;
      padding-right: 22px;
      .value-content {
        width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .fx-icon {
        position: absolute;
        right: 0;
        top: -3px;
        transform: translateY(50%);
      }
    }
  }
}
</style>

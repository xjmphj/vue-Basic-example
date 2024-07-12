<template>
  <div
    class="el-input el-input--default formula-input"
    :class="{ 'is-disabled': disabled }"
    @click="disabled ? '' : open()"
  >
    <div class="el-input__wrapper" :class="disabled ? 'disabled' : ''">
      <div class="el-input__inner">
        <div class="value-content" v-text-overflow="{ maxWidth: 300 }">{{ textLabel }}</div>
        <svg-icon name="fx" :size="16" class="cursor-pointer fx-icon" />
      </div>
    </div>
  </div>
  <formula-dialog
    v-if="dialogVisible"
    v-model:visible="dialogVisible"
    :fields="fields"
    :node-key="nodeKey"
    :treeProps="treeProps"
    :functions="functionList"
    :ensure-close-dialog="ensureCloseDialog"
    :title="title"
    :isCascade="isCascade"
    :updatedFormulaConfig="updatedFormulaConfig"
    @ensure="valueChange"
    @ensure:formula-config="formulaConfigChange"
    :oneModelField="oneModelField"
    :logicFields="logicFields"
    :isLogic="isLogic"
  />
</template>

<script setup lang="ts">
import type { functionCategory } from '@/api/convert-rules/type';
import { computed, Ref, toRefs } from 'vue';
import FormulaDialog from './formula-dialog.vue';
import { getFunctionList, handleFunctionList } from './hooks/use-functions';
import { useDialog } from '@/utils/hooks/use-dialog';
import { getFieldList, getFieldMap } from './hooks/use-fields';
import { useFormulaConfig, type IValueType, type FormulaItem } from './hooks/use-formula-config';
import { ILogicField } from './components/logic-selector/type';
import { TYPES } from './config';
import { getLogicLabel } from './hooks/use-cm';
const props = withDefaults(
  defineProps<{
    category: functionCategory; // 规则传 1 数据集传 2
    fields: any[];
    nodeKey: string; // el-tree 中的 node-key
    treeProps: any; // el-tree中的props
    modelValue?: string;
    ensureCloseDialog?: boolean;
    title?: string;
    oneModelField?: boolean;
    formulaConfig?: FormulaItem[];
    isCascade?: boolean;
    logicFields?: ILogicField;
    isLogic?: boolean;
    needString?: boolean;
    disabled?: boolean;
  }>(),
  {
    ensureCloseDialog: true,
    oneModelField: false,
    isCascade: false,
    fields: () => [],
    nodeKey: 'unionCode',
    treeProps: () => ({}),
    isLogic: false,
    needString: false,
    disabled: false,
  }
);
const emits = defineEmits<{
  (e: 'update:modelValue', value: string): void;
  (e: 'update:formulaConfig', config: FormulaItem[]): void;
}>();
const {
  category,
  modelValue,
  fields,
  treeProps,
  nodeKey,
  oneModelField,
  formulaConfig,
  isCascade,
  isLogic,
  needString,
} = toRefs(props);
const { functionList } = getFunctionList(category.value);
const { functionValueMap } = handleFunctionList(functionList);
const { visible: dialogVisible, open } = useDialog();

const fieldList = computed(() => {
  return getFieldList(fields.value, treeProps.value);
});
const fieldMap = computed(() => {
  return getFieldMap(fieldList.value, nodeKey.value);
});

const formulaValue = computed(() => {
  const formulaValue: IValueType = {};
  if (isLogic.value) {
    formulaValue.logicFormulaConfig = formulaConfig;
  } else if (formulaConfig && formulaConfig.value !== undefined && formulaConfig.value !== null) {
    formulaValue.formulaConfig = formulaConfig as Ref<FormulaItem[]>;
  } else if (modelValue && modelValue.value !== undefined) {
    formulaValue.value = modelValue as Ref<string>;
  }
  return formulaValue;
});

const updatedFormulaConfig = useFormulaConfig(formulaValue, {
  fieldMap,
  treeProps,
  functionValueMap,
});

const textLabel = computed(() => {
  if (isLogic.value) {
    return updatedFormulaConfig.value
      .map((o) => {
        if (o.type !== TYPES.logic_field) {
          return o.label;
        } else {
          return getLogicLabel(o.config, true);
        }
      })
      .join('');
  } else {
    return updatedFormulaConfig.value.map((o) => o.label).join('');
  }
});
const valueChange = (val: string) => {
  emits('update:modelValue', val);
};
const formulaConfigChange = (val: FormulaItem[]) => {
  if (isLogic.value) {
    let data: any = { elements: val };
    if (needString.value) {
      data = JSON.stringify(data);
    }
    emits('update:formulaConfig', data);
  } else {
    emits('update:formulaConfig', val);
  }
};
// 获取更新的label
// if (formulaConfig?.value) {
//   getFormulaConfig(formulaConfig.value).then((data) => {
//     if (data.success) {
//       emits('update:formulaConfig', data.data);
//     }
//   });
// }
</script>

<style scoped lang="scss">
.formula-input {
  &.el-input {
    width: 100%;
    display: block;
    .el-input__wrapper {
      display: block;
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
.disabled {
  background-color: var(--el-disabled-bg-color);
  box-shadow: 0 0 0 1px var(--el-disabled-border-color) inset;
  cursor: not-allowed;
  .el-input__inner {
    color: var(--el-disabled-text-color);
  }
}
</style>

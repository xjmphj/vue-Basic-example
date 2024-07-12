<template>
  <el-form-item :prop="prop" :rules="rules || originRules">
    <el-tree-select
      ref="treeRef"
      :model-value="modelValue.path"
      :data="data"
      :render-after-expand="false"
      :props="treeProps"
      node-key="path"
      check-strictly
      filterable
      @update:model-value="changeValueFn"
      @clear="onClear"
      clearable
      :disabled="disabled"
    >
      <template #default="{ data }"
        ><span>{{ data.key }}</span>
        <div class="type-desc">{{ data.type }}</div>
      </template>
    </el-tree-select>
  </el-form-item>
</template>

<script setup lang="ts">
import { FormItemRule } from 'element-plus';
import { toRefs, ref, computed } from 'vue';
import { initData } from '../slot-item/interface-rule-filter/util';

const props = defineProps<{
  prop?: string;
  rules?: FormItemRule[];
  data: any[];
  modelValue: {
    type: string;
    path: string;
  };
  disabled?: boolean;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void;
}>();

const { prop, rules, data, modelValue } = toRefs(props);
const disabled = computed(() => props.disabled || false);
const treeRef = ref();

const changeValueFn = (val: string) => {
  const currentData = treeRef.value?.getCurrentNode();
  emits('update:modelValue', { type: currentData?.type || 'string', path: val || '' });
};
const treeProps = {
  label: 'key',
  children: 'children',
};

const originRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
  },
];

const onClear = () => {
  emits('update:modelValue', initData().leftExpr);
};

defineOptions({
  name: 'interface-path-selector',
});
</script>

<style scoped lang="scss">
.type-desc {
  float: right;
  font-size: 11px;
  font-family: PingFang SC, PingFang SC;
  font-weight: 400;
  color: var(--color-primary);
  line-height: 18px;
  padding: 0 8px;
  background-color: var(--color-shallow-hover);
  margin-left: 10px;
}
</style>

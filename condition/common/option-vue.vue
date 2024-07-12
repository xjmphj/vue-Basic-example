<template>
  <el-form-item :prop="prop" :rules="rules">
    <OptionSelect
      v-model:union-code="data.rightExpr.unionCode"
      v-model:value="data.rightExpr.value"
      :item="data"
      :fieldData="fieldData ?? []"
      cusNodeKey="unionCode"
      :cusTreeProps="{ label: 'name', children: 'children', disabled: 'disabled' }"
    />
  </el-form-item>
</template>
<script setup lang="ts">
import { FormItemRule } from 'element-plus';
import { ICascadeItem } from '@/api/convert-rules/type';
import { ConditionItemChild } from '@/components/expression-common';
import { toRefs } from 'vue';
// import { ICusTreeProps } from '@/api/convert-rules/type';

import OptionSelect from '@/views/convert-rules/components/input-condition/option-select.vue';
const props = defineProps<{
  prop: string;
  rules?: FormItemRule[];
  fieldData?: any[];
  data: ConditionItemChild<ICascadeItem, any>;
}>();
const { data, prop, rules } = toRefs(props);
</script>
<style scoped></style>

<template>
  <el-form-item :prop="prop" :rules="rules || originRules">
    <field-cascade
      :modelCodeList="modelCodeList"
      v-model="data.leftExpr.unionCode"
      :fieldName="data.leftExpr.fieldName"
      @changeField="(getFieldData:any)=>changeFieldCodeFn(getFieldData)"
      :fieldIsCascade="true"
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { ICascadeItem, RightExprType } from '@/api/convert-rules/type';
import { ConditionItemChild } from '@/components/expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FieldCascade from '@/views/convert-rules/components/input-condition/fieldCascade.vue';
import { toRefs } from 'vue';
import { FormItemRule } from 'element-plus';
import { IModelCodeItem } from '@/views/convert-rules/components/input-condition';

const props = defineProps<{
  prop?: string;
  rules?: FormItemRule[];
  modelCodeList: IModelCodeItem[];
  data: ConditionItemChild<ICascadeItem, IExpression | RightExprType>;
}>();
const emits = defineEmits<{ (e: 'changeFieldCode'): void }>();
const { data, prop, rules, modelCodeList } = toRefs(props);
const cascadeDataKeys = [
  'type',
  'value',
  'modelCode',
  'fieldCode',
  'fieldName',
  'fieldType',
  'unionCode',
  'parentRef',
  'dataSourceType',
  'dataSource',
  'fieldSource',
  'childRef',
  'areaType',
  'parentAreaType',
  'extendConfig',
];
const changeFieldCodeFn = (getFieldData: any) => {
  const type = data.value.leftExpr?.type;
  data.value.leftExpr = {} as any;
  cascadeDataKeys.forEach((key) => {
    if (getFieldData[key]) {
      data.value.leftExpr[key] = getFieldData[key];
    }
    if (key === 'type') data.value.leftExpr[key] = type;
  });
  emits('changeFieldCode');
};
const originRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
  },
];
defineOptions({
  name: 'field-cascade',
});
</script>

<style scoped lang="scss"></style>

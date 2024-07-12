<template>
  <el-form-item :prop="prop" :rules="rules || originRules">
    <el-tree-select
      :model-value="value"
      :data="data"
      :render-after-expand="false"
      :props="treeProps"
      node-key="unionCode"
      @node-click="onNodeClick"
      @clear="onClear"
      clearable
    />
  </el-form-item>
</template>

<script setup lang="ts">
import { ICascadeItem, parentRef } from '@/api/convert-rules/type';
import { FormItemRule } from 'element-plus';
import { computed, toRefs, ref } from 'vue';
import {
  DepartmentTypeEnum,
  IStaffFiledItem as IStaffFieldTemp,
  IStaffFieldRes,
} from '@/api/custom-page/type';
import { to } from '@/utils';
import { queryDepartmentFields } from '@/api/custom-page';

type IStaffFiledItem = IStaffFieldTemp & { unionCode: string };
type IStaffFieldType = IStaffFiledItem & { refFields?: IStaffFiledItem[] };

const props = defineProps<{
  type: DepartmentTypeEnum;
  prop?: string;
  rules?: FormItemRule[];
  modelValue: ICascadeItem;
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', val: any): void;
}>();

const { prop, rules, modelValue, type } = toRefs(props);
import { parentModelType, valueType } from '@/views/convert-rules/components/type';

const treeProps = {
  label: 'fieldName',
  children: 'refFields',
};
const value = computed(() => {
  return modelValue.value?.unionCode;
});
const originRules: FormItemRule[] = [
  {
    required: true,
    trigger: 'change',
    message: '不能为空',
  },
];
const data = ref<IStaffFieldType[]>([]);

const genUniCode = (data: IStaffFieldRes[]): IStaffFieldType[] => {
  const travel = (item: IStaffFieldRes, parentUnicode: string | null): IStaffFieldType => {
    let tempRefFields: IStaffFieldType[] = [];
    const uniCode = parentUnicode ? `${parentUnicode}.${item.modelCode}` : `${item.modelCode}`;
    if (item.refFields) {
      tempRefFields = item.refFields.map((o) => travel(o, uniCode));
    }
    return {
      ...item,
      unionCode: `${uniCode}.${item.fieldCode}`,
      refFields: tempRefFields,
    };
  };
  return data.map((item) => {
    return travel(item, null);
  });
};

const getData = async () => {
  const [ret] = await to(queryDepartmentFields(type.value));
  if (ret && ret.success) {
    data.value = genUniCode(ret.data);
  }
};

const onNodeClick = (data: IStaffFiledItem, node: any) => {
  const ret: ICascadeItem = {
    type: valueType.field,
    fieldCode: data.fieldCode,
    fieldName: data.fieldName,
    modelCode: data.modelCode,
    fieldType: data.fieldType,
    unionCode: data.unionCode,
  };
  if (data.fieldType === 'model_ref') {
    ret.childRef = {
      modelCode: data.modelCode,
      fieldCode: 'id',
    };
  }
  const parentData: IStaffFiledItem[] = [];
  let temp = node;
  while (temp.parent && temp.parent.parent) {
    parentData.push(temp.parent.data);
    temp = node.parent;
  }
  if (parentData.length > 0) {
    let temp: null | parentRef | ICascadeItem = null;
    parentData.forEach((item, index) => {
      if (index === 0) {
        temp = ret;
      }
      temp!.parentRef = {
        fieldCode: item.fieldCode,
        fieldName: item.fieldName,
        modelCode: item.modelCode,
        refType: parentModelType.field,
        unionCode: item.unionCode,
      };
      temp = temp!.parentRef;
    });
  }
  emits('update:modelValue', ret);
};

const onClear = () => {
  emits('update:modelValue', {});
};

const init = () => {
  getData();
};
init();
defineOptions({
  name: 'staff-selector',
});
</script>

<style scoped lang="scss"></style>

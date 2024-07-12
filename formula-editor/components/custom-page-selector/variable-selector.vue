<template>
  <el-tree
    :default-expand-all="true"
    :load="loadNode"
    lazy
    :props="(treeProps as any)"
    :expandOnClickNode="false"
    :checkStrictly="true"
    :filter-node-method="filterMethod"
    node-key="value"
    @node-click="onNodeClick"
    ref="fieldTree"
  />
</template>

<script setup lang="ts">
import { ref, toRefs } from 'vue';
import { IPageFields } from '../../types';
import Formula from '../../utils/Formula';
import Node from 'element-plus/es/components/tree/src/model/node';
import { FieldTypeEnum } from '@/develop/views/custom-page/design/types/type';
import { insertPageField } from '../../hooks/use-cm';
import { ElTree } from 'element-plus';

const props = defineProps<{
  fieldParams: IPageFields;
  formula: Formula | null;
}>();
type TreeNodeData = {
  label: string;
  value: string;
  type: FieldTypeEnum;
} & {
  props: {
    label: string;
    value: string;
    paramType: FieldTypeEnum;
  };
};
const { fieldParams } = toRefs(props);
const fieldTree = ref<InstanceType<typeof ElTree>>();
const filterMethod = (val: string, data: any) => {
  if (!val) return true;
  return (data.label || '').includes(val);
};

const onNodeClick = (data: TreeNodeData, node: any, treeNode: unknown, event: PointerEvent) => {
  if (data.type !== undefined && data.type === FieldTypeEnum.tableRowData) {
    const dom = (event.target as HTMLElement)?.parentNode?.querySelector(
      'i.el-icon.el-tree-node__expand-icon:not(.is-leaf)'
    ) as HTMLElement;
    dom?.click();
    return;
  }
  const ret = [];
  while (node.parent) {
    ret.unshift(node.data.props);
    node = node.parent;
  }
  insertPageField(props.formula!, ret);
};
const filter = (val: string) => {
  fieldTree.value?.filter(val);
};
const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: (data: TreeNodeData) => {
    if (data.type === FieldTypeEnum.tableRowData) {
      return false;
    } else {
      return true;
    }
  },
};
const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  if (node.level == 0) {
    const params = fieldParams.value.params;
    const fields = params.fields[FieldTypeEnum.variable].map((item) => {
      return {
        label: item.label,
        value: item.value,
        type: FieldTypeEnum.variable,
        props: {
          label: item.label,
          value: item.value,
          paramType: FieldTypeEnum.variable,
        },
      };
    });
    if (params.rowData) {
      fields.push({
        label: params.rowData.iterationVariable,
        value: '__rowObject__',
        type: FieldTypeEnum.tableRowData,
        props: {
          label: params.rowData.iterationVariable,
          value: '__rowObject__',
          paramType: FieldTypeEnum.tableRowData,
        },
      });
    }
    return resolve(fields);
  } else {
    if (node.data.type === FieldTypeEnum.tableRowData && fieldParams.value.params.rowData?.fields) {
      const fields = fieldParams.value.params.rowData.fields.map((item) => {
        return {
          label: item.label,
          value: item.value,
          type: FieldTypeEnum.tableRowDataField,
          props: {
            label: item.label,
            value: item.value,
            paramType: FieldTypeEnum.tableRowDataField,
          },
        };
      });
      return resolve(fields);
    }
    return resolve([]);
  }
};
defineExpose({
  filter,
});
defineOptions({
  name: 'variable-selector',
});
</script>

<style scoped lang="scss"></style>

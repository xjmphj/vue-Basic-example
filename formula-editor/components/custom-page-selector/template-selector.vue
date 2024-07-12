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
import { FieldTypeEnum as VariableTypeEnum } from '@dev/views/custom-page/design/types/type';
import { getParentWidgetByUuid, getWidgetDataByUuid } from '@/core/views/custom-page/preview/util';
import { WidgetItemData } from '@/develop/views/custom-page/design/types/widget-data.type';
import {
  assertTableWidget,
  loopContainer,
  TemplateTypeEnum,
  WidgetEnum,
} from '@/develop/views/custom-page/design/config';
import { ITableData } from '@/develop/views/custom-page/design/types/widget/table';
import { ConfigKey } from '@/develop/views/custom-page/design/config/widget-config';
import { TableSubPositionEnum } from '@/develop/store/custom-page/extra-params';
import { ElTree } from 'element-plus';
import { insertPageField } from '../../hooks/use-cm';
import { treeNodeType } from '@dev/views/custom-page/design/util/outline-template';
import { IPanelData, IPanelItemData } from '@/develop/views/custom-page/design/types/widget/panel';
import { rowLabelSuffix } from './config';

type TreeNodeData = {
  label: string;
  value: string;
  type?: number; // 数据绑定模板的类型
  componentCode: string; // 组件的uuid
  parentId?: string;
} & {
  props: {
    label: string;
    value: string;
    paramType: VariableTypeEnum;
  };
};
const props = defineProps<{
  fieldParams: IPageFields;
  formula: Formula | null;
}>();

const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: (data: TreeNodeData) => {
    if (data.type === undefined || !treeNodeType.includes(data.type)) {
      return true;
    } else {
      return false;
    }
  },
};
const fieldTree = ref<InstanceType<typeof ElTree>>();
const { fieldParams } = toRefs(props);
const widgetCacheMap = new Map<string, WidgetItemData>();
const parentWidgetCacheMap = new Map<string, WidgetItemData>();
const getWidgetData = (uuid: string) => {
  const pageData = props.fieldParams.params.fields[VariableTypeEnum.widget];
  if (widgetCacheMap.get(uuid)) {
    return widgetCacheMap.get(uuid);
  } else {
    const data = getWidgetDataByUuid(uuid, pageData);
    data && widgetCacheMap.set(data.uuid, data);
    return data;
  }
};

const getParentWidgetData = (uuid: string) => {
  const pageData = props.fieldParams.params.fields[VariableTypeEnum.widget];
  const cached = parentWidgetCacheMap.get(uuid);
  if (cached) {
    return cached;
  } else {
    const data = getParentWidgetByUuid(pageData, uuid);
    data.widget && parentWidgetCacheMap.set(uuid, data.widget);
    return data.widget;
  }
};
function getRowLabelSuffix(widget?: WidgetItemData | null) {
  return widget && rowLabelSuffix[widget.type] ? rowLabelSuffix[widget.type] : '行';
}
const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  if (node.level === 0) {
    const data = fieldParams.value.params.fields[VariableTypeEnum.template]
      .filter((item) => !(fieldParams.value.params.templateExclude ?? []).includes(item.code))
      .sort((a, b) => a.type - b.type)
      .map((item) => {
        let prefixTitle = '';
        if (item.type === TemplateTypeEnum[WidgetEnum.page]) {
          prefixTitle = '页面';
        } else if (item.type === TemplateTypeEnum[WidgetEnum.panelItem]) {
          const widgetData = getWidgetData(item.componentCode) as IPanelItemData;
          const parentWidgetData = getParentWidgetData(item.componentCode) as IPanelData;
          if (!widgetData || !parentWidgetData) return;
          prefixTitle = `${parentWidgetData.config[ConfigKey.attribute].title}${
            widgetData.config[ConfigKey.attribute].title
          }`;
        } else {
          const widgetData = getWidgetData(item.componentCode) as ITableData;
          widgetData && (prefixTitle = `${widgetData.config[ConfigKey.attribute].title}`);
        }
        const label = `${prefixTitle}${item.name}`;
        return {
          label,
          value: item.code,
          componentCode: item.componentCode,
          type: item.type,
          props: {
            label,
            value: item.code,
            paramType: VariableTypeEnum.template,
          },
        };
      });
    resolve(data.filter(Boolean));
  } else if (treeNodeType.includes(node.data.type)) {
    const nodeData = node.data as TreeNodeData;
    const position = fieldParams.value.params.position;
    const widgetData = getWidgetData(nodeData.componentCode);
    // const containerWidget = position?.parentId ? getWidgetData(position.parentId) : null;
    if (
      position &&
      loopContainer.includes(position.in) &&
      position.parentId === nodeData.componentCode &&
      position.params.subPosition === TableSubPositionEnum.row
    ) {
      return resolve([
        {
          label: `当前${getRowLabelSuffix(widgetData)}`,
          value: `${nodeData.value}.current`,
          componentCode: nodeData.componentCode,
          props: {
            label: `当前${getRowLabelSuffix(widgetData)}`,
            value: `${nodeData.value}`, // 记录数据绑定模板的codes
            paramType: VariableTypeEnum.tplCurrentRow,
          },
        },
      ]);
    } else {
      // 如果在其他处开启表达式编辑器，可以看见全部行
      const allRowDataLabel = `全部${getRowLabelSuffix(widgetData)}`;
      const allRowData = {
        label: allRowDataLabel,
        value: `${nodeData.value}.all`,
        componentCode: nodeData.componentCode,
        props: {
          label: allRowDataLabel,
          value: `${nodeData.value}.all`,
          paramType: VariableTypeEnum.tplAllRow,
        },
      };
      const selectRowDataLabel = `选中${getRowLabelSuffix(widgetData)}`;
      const selectRowData = {
        label: selectRowDataLabel,
        value: `${nodeData.value}.select`,
        componentCode: nodeData.componentCode,
        props: {
          label: selectRowDataLabel,
          value: `${nodeData.value}.select`,
          paramType: VariableTypeEnum.tplSelectRow,
        },
      };
      const data = [allRowData];
      // 如果表格开启了选中行，也可以看见选中行
      if (widgetData && assertTableWidget(widgetData)) {
        if (widgetData?.config[ConfigKey.function].batchOperate) {
          data.push(selectRowData);
        }
      }
      // 卡片列表可以选择卡片，所有有选中行
      if (widgetData?.type === WidgetEnum.cardList) {
        data.push(selectRowData);
      }
      return resolve(data);
    }
  } else {
    return resolve([]);
  }
};
const filterMethod = (val: string, data: any) => {
  if (!val) return true;
  return (data.label || '').includes(val);
};
const filter = (val: string) => {
  fieldTree.value?.filter(val);
};
const onNodeClick = (data: TreeNodeData, node: any, treeNode: unknown, event: PointerEvent) => {
  if (data.type !== undefined && treeNodeType.includes(data.type)) {
    const dom = (event.target as HTMLElement).parentNode?.querySelector(
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

defineExpose({
  filter,
});
defineOptions({
  name: 'template-selector',
});
</script>

<style scoped lang="scss"></style>

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
    @node-click="widgetFieldClickHandler"
    ref="widgetFieldTree"
  >
    <template #="{ data }">
      <div class="field-item">
        <div class="desc">
          <span>{{ data.label }}</span>
        </div>
        <div class="label-container" v-if="getLabel(data.type)">
          <div class="field-type">
            {{ getLabel(data.type) }}
          </div>
        </div>
      </div>
    </template>
  </el-tree>
</template>

<script setup lang="ts">
import Node from 'element-plus/es/components/tree/src/model/node';
import { IPageFields } from '../../types';
import Formula from '../../utils/Formula';
import { FieldTypeEnum, IPageExpression } from '@develop/views/custom-page/design/types/type';
import {
  assertContainerWidget,
  assertTableWidget,
  containerWidgets,
  loopContainer,
  WidgetEnum,
  WidgetGroupEnum,
} from '@/develop/views/custom-page/design/config';
import { getWidgetDataByUuid } from '@core/views/custom-page/preview/util';
import { ITableColumn } from '@/develop/views/custom-page/design/types/widget/table';
import { ConfigKey } from '@/develop/views/custom-page/design/config/widget-config';
import { TableSubPositionEnum } from '@/develop/store/custom-page/extra-params';
import { EMPTY_NODE, fieldCanSelect, rowLabelSuffix } from './config';
import { ElTree } from 'element-plus';
import {
  getWidgetGroupType,
  widgetTypeMap,
} from '@/develop/views/custom-page/design/config/overview';
import { insertPageField } from '../../hooks/use-cm';
import { ref } from 'vue';
import { findParentNode } from '@/utils';
import {
  ContainerWidgetData,
  WidgetItemData,
} from '@/develop/views/custom-page/design/types/widget-data.type';

type TreeNodeData = {
  label: string;
  value: string;
  type: WidgetEnum | FieldTypeEnum;
  parentId?: string;
  stop?: boolean; // 取值时，向上找到该节点后，是否停止
  skip?: boolean; // 取值时，向上找到该节点，是否跳过该节点
} & { props: IPageExpression['config'][number] };
const props = defineProps<{
  fieldParams: IPageFields;
  formula: Formula | null;
}>();

const widgetFieldTree = ref<InstanceType<typeof ElTree>>();
const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: (data: TreeNodeData) => {
    if (
      !containerWidgets.includes(data.type as WidgetEnum) &&
      data.type !== FieldTypeEnum.iteration &&
      data.value !== props.fieldParams.params.fields.iteration?.uuid
    ) {
      return true;
    } else {
      return false;
    }
  },
  class: (data: TreeNodeData) => {
    if (data.value === EMPTY_NODE) {
      return 'tree_node_hide-0810';
    } else {
      return '';
    }
  },
};
const getLabel = (type: WidgetEnum | FieldTypeEnum) => {
  if (type === FieldTypeEnum.iteration) {
    return `对象`;
  } else if (type === FieldTypeEnum.virtual) {
    return '字段';
  } else if (type === FieldTypeEnum.tableField) {
    return '表头';
  } else {
    return widgetTypeMap[type];
  }
};
const filterMethod = (val: string, data: any) => {
  if (!val) return true;
  return (data.label || '').includes(val);
};
const widgetFieldClickHandler = (
  data: TreeNodeData,
  node: any,
  treeNode: unknown,
  event: PointerEvent
) => {
  if (
    !fieldCanSelect.includes(data.type as FieldTypeEnum) &&
    getWidgetGroupType(data.type as WidgetEnum) !== WidgetGroupEnum.form
  ) {
    const node = findParentNode(event.target as HTMLElement, 'field-item');
    const dom = node?.parentNode?.querySelector(
      'i.el-icon.el-tree-node__expand-icon:not(.is-leaf)'
    ) as HTMLElement;
    dom?.click();
    return;
  }
  const ret = [];
  let currentNode = true; // 第一个节点要塞进去
  while (node.parent) {
    if (!node.data.skip || currentNode) {
      ret.unshift(node.data.props);
    }
    if (node.data.stop) {
      break;
    }
    currentNode = false;
    node = node.parent;
  }
  insertPageField(props.formula!, ret);
};

const isNodeInTable = (node: Node) => {
  const arr: WidgetEnum[] = [];
  while (node && node.data) {
    arr.push(node.data.type);
    node = node.parent;
  }
  return arr.some((item) => loopContainer.includes(item));
};

const isStop = (parentNode: Node) => {
  return !isNodeInTable(parentNode);
};

const isSkip = (parentNode: Node, currentData: WidgetItemData) => {
  const inTable = isNodeInTable(parentNode);
  if (!inTable) return false;
  return [WidgetEnum.tableColumn, WidgetEnum.columItem, WidgetEnum.column].includes(
    currentData.type
  );
};
function resolveLoopContainer(widgetData: WidgetItemData) {
  const ret: any[] = [];
  const allRowData = {
    label: `全部${rowLabelSuffix[widgetData.type]}`,
    type: FieldTypeEnum.allRow,
    value: `${widgetData.uuid}.all`, // 保证node-key的唯一性，加一个parentId记录其值
    parentId: widgetData.uuid,
    props: {
      label: `全部${rowLabelSuffix[widgetData.type]}`,
      value: `${widgetData.uuid}.all`,
      paramType: FieldTypeEnum.allRow,
    },
  };
  ret.push(allRowData);
  const selectRowData = {
    label: `选中${rowLabelSuffix[widgetData.type]}`,
    type: FieldTypeEnum.selectRow,
    value: `${widgetData.uuid}.select`, // 保证node-key的唯一性，加一个parentId记录其值
    parentId: widgetData.uuid,
    props: {
      label: `选中${rowLabelSuffix[widgetData.type]}`,
      value: `${widgetData.uuid}.select`,
      paramType: FieldTypeEnum.selectRow,
    },
  };
  // 卡片列表要添加选中行层级
  if (widgetData.type === WidgetEnum.cardList) {
    ret.push(selectRowData);
  }
  const currentRowData = {
    label: `当前${rowLabelSuffix[widgetData.type]}`,
    type: FieldTypeEnum.currentRow,
    value: `${widgetData.uuid}.current`, // 保证node-key的唯一性，加一个parentId记录其值
    parentId: widgetData.uuid,
    stop: true,
    props: {
      label: `当前${rowLabelSuffix[widgetData.type]}`,
      value: `${widgetData.uuid}.current`,
      paramType: FieldTypeEnum.currentRow,
    },
  };
  const position = props.fieldParams.params.position;
  if (position && position.parentId === widgetData.uuid) {
    const subPosition = position.params.subPosition;
    const batchOperate = widgetData.config[ConfigKey.function]?.batchOperate;
    // 开启了批量选择的表格要添加选中行层级
    if (subPosition === TableSubPositionEnum.operation && batchOperate) {
      ret.push(selectRowData);
    }
    if (subPosition === TableSubPositionEnum.row) {
      ret.length = 0;
      ret.push(currentRowData);
    }
  }
  return ret;
}
function resolveNode(node: Node, widgetData: ContainerWidgetData): any[] {
  const ret: any[] = widgetData.children
    .filter((item) => !(props.fieldParams.params.widgetExclude ?? []).includes(item.uuid))
    .map((item, index) => {
      let label = '';
      if (item.type === WidgetEnum.columItem) {
        label = `第${index + 1}栏`;
      } else if (item.type === WidgetEnum.column) {
        label = `分栏`;
      } else if (item.type === WidgetEnum.tableColumn) {
        label = item.title;
      } else {
        label = (item.config.attribute as any).title;
      }

      return {
        label,
        value: item.uuid,
        type: item.type !== WidgetEnum.tableColumn ? item.type : FieldTypeEnum.tableField,
        // 非表格控件，选到当前控件即可
        // 表格中的控件，需要向上找到列表那个节点后，stop
        // 所以stop的逻辑是，非表格中的控件和表格控件，本身stop,表格中的控件
        stop: isStop(node),
        // 表格中的表头和取不到值的控件(如表格中的分栏等)，应该skip
        skip: isSkip(node, item),
        props: {
          label,
          value: item.uuid,
          paramType: isNodeInTable(node) ? FieldTypeEnum.tableField : FieldTypeEnum.widget,
        },
      };
    });
  return ret;
}
const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  if (node.level == 0) {
    const pageData = props.fieldParams.params.fields[FieldTypeEnum.widget];
    resolve([
      {
        label: '页面',
        value: pageData.uuid,
        type: WidgetEnum.page,
        props: {
          label: '页面',
          value: pageData.uuid,
          paramType: FieldTypeEnum.widget,
        },
      },
    ]);
  } else {
    const data = node.data as TreeNodeData;
    const pageData = props.fieldParams.params.fields[FieldTypeEnum.widget];
    if (data.value === props.fieldParams.params.fields[FieldTypeEnum.iteration]?.uuid) {
      const iteration = props.fieldParams.params.fields[FieldTypeEnum.iteration]!;
      return resolve([
        {
          label: iteration.label,
          value: iteration.value,
          type: FieldTypeEnum.iteration,
          stop: true,
          props: {
            label: iteration.label,
            value: iteration.value,
            paramType: FieldTypeEnum.iteration,
          },
        },
      ]);
    } else if (data.type === FieldTypeEnum.iteration) {
      const iterationChildren =
        props.fieldParams.params.fields[FieldTypeEnum.iteration]?.children ?? [];
      const data = iterationChildren.map((item) => ({
        label: item.label,
        value: item.value,
        type: FieldTypeEnum.virtual,
        props: {
          label: item.label,
          value: item.value,
          paramType: FieldTypeEnum.virtual,
        },
      }));
      return resolve(data);
    } else if (
      data.type === FieldTypeEnum.allRow ||
      data.type === FieldTypeEnum.selectRow ||
      data.type === FieldTypeEnum.currentRow
    ) {
      const widgetData = getWidgetDataByUuid(data.parentId!, pageData);
      // 表格增加表头
      if (widgetData && assertTableWidget(widgetData)) {
        const data = widgetData.children.map((o) => {
          return {
            label: (o as ITableColumn).title,
            value: o.uuid,
            type: FieldTypeEnum.tableField,
            skip: true,
            props: {
              label: (o as ITableColumn).title,
              value: o.uuid,
              paramType: FieldTypeEnum.tableField,
            },
          };
        });
        return resolve(data);
      }
      // 卡片列表
      if (widgetData && WidgetEnum.cardList === widgetData.type) {
        return resolve(resolveNode(node, widgetData));
      }
      return resolve([]);
    }
    const widgetData = getWidgetDataByUuid(data.value, pageData);
    if (!widgetData) return resolve([]);
    // 容器类组件
    if (assertContainerWidget(widgetData)) {
      if (widgetData.children.length === 0) {
        return resolve([
          {
            label: '',
            value: EMPTY_NODE,
          },
        ]);
      } else {
        // 如果是循环类控件需要添加全部、选中、当前行层级
        if (loopContainer.includes(widgetData.type)) {
          return resolve(resolveLoopContainer(widgetData));
        } else {
          return resolve(resolveNode(node, widgetData));
        }
      }
    }
    return resolve([]);
  }
};
const filter = (val: string) => {
  widgetFieldTree.value?.filter(val);
};
defineExpose({
  filter,
});
</script>

<style scoped lang="scss">
.field-item {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .desc {
    flex: 1 0 0;
    overflow: hidden;
    span {
      display: inline-block;
      overflow: hidden;
      width: 100%;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
  .label-container {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    > div {
      height: 20px;
      border-radius: 2px;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 var(--padding-1);
      font-size: 12px;
    }
    .field-type {
      background: rgba(22, 93, 255, 0.1);
      color: #165dff;
      margin-right: var(--margin-1);
    }
  }
}
</style>

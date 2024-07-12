<template>
  <el-tree
    :data="fields"
    :props="fieldTreeProps"
    node-key="value"
    ref="fieldTreeRef"
    :expandOnClickNode="false"
    :checkStrictly="true"
    :load="loadNode"
    :lazy="true"
    :filter-node-method="filterMethod"
    @node-click="fieldClickHandler"
  >
    <template #="{ data, node }">
      <div
        class="field-item"
        :draggable="nodeDraggable"
        @dragstart="ondragstart(data, node, $event)"
      >
        <div class="desc">
          <span>{{ data[fieldTreeProps.label] }}</span>
        </div>
        <div class="label-container">
          <div class="field-type">
            {{ getFieldTypeLabel(data.paramType, data) }}
          </div>
          <div class="param-scope" v-if="!!data.paramScope && needTypeLabel">
            {{ data.paramScope === ParamScope.input ? '入参' : '出参' }}
          </div>
        </div>
      </div>
    </template>
  </el-tree>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { ILogicField, LogicFieldType, TreeNodeType } from './type';
import {
  FieldType,
  listTypes,
  parameterTypes,
  superFieldList,
  sysFieldList,
  ParamScope,
} from '@develop/views/logic-arrangement/config/parameter';
import { to } from '@/utils';
import { getFieldsByCode } from '@/api/model';
import { EIsShowType } from '@/api/model/type';
import { getViewFields } from '@/api/logic/index';
import cloneDeep from 'lodash/cloneDeep';
import useSysFields from '@develop/views/view-design/hooks/config';
import { ElTree } from 'element-plus';

const props = withDefaults(
  defineProps<{
    field: ILogicField;
    current: LogicFieldType;
    fieldCascade?: boolean;
    needTypeLabel?: boolean;
    nodeDraggable?: boolean;
  }>(),
  { needTypeLabel: true, nodeDraggable: false }
);
const { field, current, fieldCascade, needTypeLabel, nodeDraggable } = toRefs(props);
const emits = defineEmits<{
  (e: 'field-click', data: any, node: any): void;
  (e: 'drag-start', data: any, node: any, ev: DragEvent): void;
}>();
const fieldTreeProps = {
  label: 'label',
  children: 'children',
  isLeaf: 'isLeaf',
  class: () => 'tree-node-0530',
};
const { showFieldNames } = useSysFields();
const fieldTreeRef = ref<InstanceType<typeof ElTree>>();
// 用来展示的数的数据
const fields = computed(() => {
  const data = field.value[current.value];

  return data.map((item) => {
    return {
      label: item.paramName,
      value: item.paramCode,
      paramType: item.paramType,
      generalRef: item.generalRef,
      paramScope: item.paramScope,
      generalType: item.generalType,
      isLeaf:
        !superFieldList.concat(sysFieldList).includes(item.paramType) ||
        ([FieldType.list, FieldType.map].includes(item.paramType) &&
          ![FieldType.model, FieldType.view].includes(item.generalType!)),

      type: TreeNodeType.logic,
      prop: {
        // prop中的数据用来传递给后端
        logicVariable: {
          generalRef: item.generalRef,
          paramCode: item.paramCode,
          paramName: item.paramName,
          paramType: item.paramType,
          generalType: item.generalType,
        },
        variableType: TreeNodeType.logic,
      },
    };
  });
});
const loadModel = async (modelCode: string, data: any, resolve: (data: any[]) => void) => {
  const [ret] = await to(
    getFieldsByCode({
      modelCode,
      showSystem: EIsShowType.yes,
      showVirtual: EIsShowType.no,
      showEnable: EIsShowType.no,
    })
  );
  if (ret && ret.success) {
    const o = ret.data.fields.map((item) => {
      // 是否单值引用
      // const isSingleRef = !!item.dataSourceType;
      const isSingleRef =
        item.fieldType === 'single_ref' ||
        item.fieldType === 'model_ref' ||
        item.fieldType === 'dict' ||
        sysFieldList.includes(item.fieldType as FieldType);
      // 是否是级联出来的字段
      // 通过逻辑服务字段展开的字段和通过模型上的字段级联出来的字段要区分开
      const isCascade = data.type !== TreeNodeType.logic;
      // 是否是级联字段
      const variableType = isCascade ? TreeNodeType.cascade_model : TreeNodeType.model_field;
      const propData = {
        fieldCode: item.fieldCode,
        fieldName: item.fieldName,
        fieldType: item.fieldType,
        modelCode: item.modelCode,
        refExtInfo: {
          refCode: item.dataSource,
          refType:
            item.fieldType === 'model_ref'
              ? 'model'
              : item.fieldType === 'dict'
              ? 'dict'
              : item.dataSourceType, // 单值引用取 dataSourceType
        },
      };
      const prop = isCascade
        ? { refVariable: propData, variableType: TreeNodeType.cascade_model }
        : { modelFieldVariable: propData, variableType: TreeNodeType.model_field };

      let paramType = item.fieldType;
      if (listTypes.includes(data.paramType)) {
        paramType = FieldType.list;
      } else if (item.fieldType === 'single_ref') {
        paramType = FieldType.model;
      }
      return {
        label: item.fieldName,
        value: item.fieldCode,
        type: variableType,
        isLeaf: !fieldCascade?.value ? !fieldCascade?.value : !isSingleRef,
        modelCode: item.modelCode,
        paramType: paramType,
        generalRef: item.dataSource,
        generalType: sysFieldList.includes(item.fieldType as FieldType)
          ? item.fieldType
          : item.dataSourceType,
        paramScope: data.paramScope,
        prop,
      };
    });
    resolve(o);
  }
};
const loadView = async (viewCode: string, data: any, resolve: (data: any[]) => void) => {
  const [ret] = await to(getViewFields({ viewCode, showDisable: false }));
  if (ret && ret.success) {
    const o = ret.data.map((item) => {
      let paramType = item.fieldType;
      if (listTypes.includes(data.paramType)) {
        paramType = FieldType.list;
      } else if (item.fieldType === 'single_ref') {
        paramType = FieldType.model;
      }
      return {
        label: item.fieldAlias,
        value: item.fieldActualAlias,
        paramScope: data.paramScope,
        paramType,
        isLeaf: true,
        prop: {
          variableType: TreeNodeType.view_field,
          viewFieldVariable: {
            fieldActualAlias: item.fieldActualAlias,
            fieldAlias: item.fieldAlias,
            fieldType: item.fieldType,
            viewCode: viewCode,
          },
        },
      };
    });
    resolve(o);
  } else {
    resolve([]);
  }
};
const loadDict = (code: string, data: any, resolve: (data: any[]) => void) => {
  const o = [
    {
      name: '字典名称',
      value: 'dictValue',
    },
    {
      name: '字典编码',
      value: 'dictKey',
    },
  ].map((item) => ({
    label: item.name,
    value: item.value,
    isLeaf: true,
    paramScope: data.paramScope,
    paramType: FieldType.text,
    prop: {
      refDictOptionVariable: {
        fieldCode: item.value,
        fieldName: item.name,
        refDict: code,
      },
      variableType: TreeNodeType.cascade_dict_option,
    },
  }));
  resolve(o);
};
const loadDeptUserStaff = (type: string, data: any, resolve: (data: any[]) => void) => {
  const o = cloneDeep(showFieldNames[type]).map((item) => ({
    label: item.label,
    value: item.value,
    isLeaf: true,
    paramScope: data.paramScope,
    paramType: item.type,
    prop: {
      refCommonVariable: {
        fieldCode: item.value,
        fieldName: item.label,
        fieldType: item.type,
      },
      variableType: TreeNodeType[`cascade_${type}`],
    },
  }));
  resolve(o);
};
const loadNode = async (node: any, resolve: (data: any[]) => void) => {
  // 第0级，直接从fields中取数据
  if (node.level == 0) {
    resolve(fields.value);
  } else if (node.data.type === TreeNodeType.logic) {
    // 逻辑服务的字段
    if (
      // 参数类型为 模型，组合模型或者模型的集合，需要继续展开
      node.data.paramType === FieldType.model ||
      node.data.paramType === FieldType.combo_model ||
      (listTypes.includes(node.data.paramType) && node.data.generalType === FieldType.model)
    ) {
      const modelCode = node.data.generalRef;
      loadModel(modelCode, node.data, resolve);
    } else if (
      // 参数类型为视图或者视图的集合，需要继续展开
      node.data.paramType === FieldType.view ||
      (listTypes.includes(node.data.paramType) && node.data.generalType === FieldType.view)
    ) {
      const viewCode = node.data.generalRef;
      loadView(viewCode, node.data, resolve);
    } else if (
      // 部门用户人员
      sysFieldList.includes(node.data.paramType)
    ) {
      loadDeptUserStaff(node.data.paramType, node.data, resolve);
    }
  } else if ([TreeNodeType.model_field, TreeNodeType.cascade_model].includes(node.data.type)) {
    if (node.data.generalType === 'model') {
      const modelCode = node.data.generalRef;
      loadModel(modelCode, node.data, resolve);
    } else if (node.data.generalType === 'dict') {
      const code = node.data.generalRef;
      loadDict(code, node.data, resolve);
    } else if (sysFieldList.includes(node.data.generalType)) {
      loadDeptUserStaff(node.data.generalType, node.data, resolve);
    }
  }
};

const getFieldTypeLabel = (fieldType: FieldType, data: any) => {
  // 非逻辑编排的数据类型特殊处理
  if (data.paramType === 'amount') {
    return '金额';
  } else if (data.paramType === 'multi_ref') {
    return '多值引用';
  } else if (
    (data.paramType === 'model' && data.generalType === 'dict') ||
    data.paramType === 'dict' ||
    data.paramType === 'dict_ref'
  ) {
    return '文本';
  } else if (data.paramType === 'model_ref') {
    return '模型';
  } else {
    const item = parameterTypes.find((item) => item.type === fieldType);
    return item ? item.desc : '';
  }
};
const filterMethod = (val: string, data: any) => {
  if (!val) return true;
  return (data[fieldTreeProps.label] || '').includes(val);
};
const fieldClickHandler = (data: any, node: any) => {
  emits('field-click', data, node);
};
const ondragstart = (data: any, node: any, ev: DragEvent) => {
  emits('drag-start', data, node, ev);
};

const filter = (val: string) => {
  fieldTreeRef.value?.filter(val);
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
  overflow: hidden;
  .desc {
    flex: 1 0 0;
    overflow: hidden;
    display: flex;
    align-items: center;

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
      margin-right: var(-1);
    }
    .param-scope {
      background: rgba(83, 98, 134, 0.1);
      color: #385073;
    }
  }
}
</style>

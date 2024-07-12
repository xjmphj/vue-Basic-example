<template>
  <custom-title desc="参数：" />
  <div class="container">
    <top-nav :navList="fieldParams.navList" v-model:current="currentNav" @change="onNavChange" />
    <div class="search-container">
      <search-input
        placeholder="请输入"
        v-model="keySearch"
        :realTime="true"
        @searchClick="onSearch"
      />
      <el-scrollbar class="scroll-container" height="194px">
        <el-tree
          :data="treeData"
          lazy
          :load="loadNode"
          :props="treeProps"
          :expandOnClickNode="false"
          :checkStrictly="true"
          :filter-node-method="filterMethod"
          node-key="value"
          @node-click="insertField"
          ref="widgetFieldTree"
        >
          <template #="{ data }">
            <div class="field-item">
              <div class="desc">
                <span>{{ data.label }}</span>
              </div>
              <!-- <div class="label-container" v-if="data.type">
                <div class="field-type">
                  {{ getLabel(data.type) }}
                </div>
              </div> -->
            </div>
          </template>
        </el-tree>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { FieldTypeEnum } from '@develop/views/custom-page/design/types/type';
import { ref, toRefs } from 'vue';
import TopNav from '../logic-selector/nav.vue';
import Formula from '../../utils/Formula';
import { ICustomFields } from '../../types';
import { TYPES } from '../../config';
// import { WidgetEnum } from '@develop/views/custom-page/design/config';
import Node from 'element-plus/es/components/tree/src/model/node';
// import { widgetTypeMap } from '@dev/views/custom-page/design/config/overview';
import { ElTree } from 'element-plus';
import CustomTitle from '../title.vue';
import { getTopParentsNoShipFromInner } from '@/utils/index';
import { useCascadeData } from '@/views/convert-rules/components/input-condition/use-cascade-data';
import { mendTreeData } from '@/utils/index';
/**
 *  说明:
 *  树形数据结构为
 * treeItem = {
      label: itemI?.editField?.fieldName,  // 用于显示
      value: itemI?.editField?.unionCode, // 值
      type: 'virtual', // 用于右侧小标签，不传就不显示，拓展的话需要额外开发
      cantInsert: true, // 某些字段不能插入编辑器的要写true
      isLeaf: true, // 是否是叶子节点
    };
 *
 *  */
const props = defineProps<{
  fieldParams: ICustomFields;
  formula: Formula | null;
}>();
const { fieldParams } = toRefs(props);
const currentNav = ref('');
// 树形列表数据
const treeData = ref<ITree[]>([]);
const initFn = () => {
  if (fieldParams.value?.navList.length) {
    const nowShowNav = fieldParams.value?.navList[0];
    currentNav.value = nowShowNav.value;
    treeData.value = nowShowNav.dataList;
  }
};
initFn();
const treeProps = {
  label: 'label',
  children: 'children',
  isLeaf: 'isLeaf',
};

const keySearch = ref('');
const widgetFieldTree = ref<InstanceType<typeof ElTree>>();
const onSearch = (val: string) => {
  widgetFieldTree.value?.filter(val);
};
const filterMethod = (val: string, data: any) => {
  if (!val) return true;
  return (data.label || '').includes(val);
};
const onNavChange = () => {
  const nowShowNav = fieldParams.value?.navList.find((item) => item.value === currentNav.value);
  if (nowShowNav) {
    treeData.value = nowShowNav.dataList;
  }
  widgetFieldTree.value?.filter(keySearch.value);
};

// const getLabel = (type: WidgetEnum | FieldTypeEnum) => {
//   if (type === FieldTypeEnum.iteration) {
//     return `对象`;
//   } else if (type === FieldTypeEnum.virtual) {
//     return '字段';
//   } else {
//     return widgetTypeMap[type];
//   }
// };

const { getModelData, getDicData } = useCascadeData({
  fieldIsCascade: !!fieldParams.value?.lazy,
  label: 'label',
});

const loadNode = async (node: Node, resolve: (data: any[]) => void) => {
  const childrenStr = treeProps.children || 'children';
  if (node.level === 0) {
    return resolve(treeData.value);
  } else if (node.data[childrenStr]) {
    resolve(node.data[childrenStr]);
  } else if (node.data?.unionCode.indexOf(`${node.data?.dataSource}`) > -1) {
    // 有循环引用的时候不进行下级展示
    resolve([]);
  } else if (
    (node.data?.dataSource &&
      node.data?.dataSourceType == 'model' &&
      node.data.fieldType == 'single_ref') ||
    node.data.fieldType === 'model_ref'
  ) {
    let newSourceFields = await getModelData(node);
    newSourceFields = mendTreeData(newSourceFields, (treeItem: any) => {
      treeItem.label = treeItem.fieldName;
      treeItem.value = treeItem.unionCode;
      treeItem.isLeaf = !treeItem?.dataSource;
      if (node.data?.fieldArea) {
        treeItem.fieldArea = node.data?.fieldArea;
      }
    });
    resolve(newSourceFields);
  } else if (
    (node.data?.dataSource &&
      node.data?.dataSourceType == 'dict' &&
      node.data.fieldType == 'single_ref') ||
    node.data.fieldType === 'dict'
  ) {
    let newSourceFields = await getDicData(node);
    newSourceFields = mendTreeData(newSourceFields, (treeItem: any) => {
      treeItem.label = treeItem.fieldName;
      treeItem.value = treeItem.unionCode;
      treeItem.isLeaf = !treeItem?.dataSource;
      if (node.data?.fieldArea) {
        treeItem.fieldArea = node.data?.fieldArea;
      }
    });
    resolve(newSourceFields);
  } else {
    resolve([]);
  }
};
const insertField = (data: ITree, node: any, treeNode: unknown, event: PointerEvent) => {
  if (data.cantInsert) {
    const parent = getTopParentsNoShipFromInner(event.target, 'parentElement', (el) => {
      return el.className === 'el-tree-node__content';
    });
    const dom = parent[0]?.querySelector(
      'i.el-icon.el-tree-node__expand-icon:not(.is-leaf)'
    ) as HTMLElement;
    dom?.click();
    return;
  }
  props.formula.insertField(data.label!, data.value!, [data], TYPES.custom_page);
};
</script>

<style scoped lang="scss">
.container {
  height: 274px;
  width: 300px;
  overflow: hidden;
  border: 1px solid var(--border-color-3);
  border-radius: 2px;
  :deep() {
    .nav {
      border: none;
    }
  }
  .search-container {
    padding: 12px var(--padding-2);
    .scroll-container {
      margin-top: 4px;
    }
  }
}
</style>
<style lang="scss" scoped>
.field-item {
  height: 100%;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .desc {
    flex: 1 0 0;
    overflow: hidden;
    display: flex;
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
.field-item-variable {
  display: flex;
  width: 100%;
  line-height: 36px;
  color: #3e4754;
  cursor: pointer;
}
</style>
<style lang="scss">
.tree_node_hide-0810 {
  display: none;
}
</style>

<template>
  <custom-title v-if="!!fieldParams" desc="参数：" />
  <div class="container">
    <top-nav :nav-list="navList" v-model:current="currentNav" @change="changeNav" />
    <div class="search-container">
      <search-input
        placeholder="请输入"
        v-model="keySearch"
        :realTime="true"
        @searchClick="onFieldSearch"
      />
      <el-scrollbar class="scroll-container" height="194px">
        <field-selector
          :field="field"
          :current="currentNav"
          :fieldCascade="fieldCascade"
          @field-click="fieldClickHandler"
          ref="fieldTreeRef"
        />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ILogicField, LogicFieldType } from './type';
import { ref, computed, nextTick, toRefs } from 'vue';

import Formula from '../../utils/Formula';
import { insertLogicField } from '../../hooks/use-cm';
import TopNav from './nav.vue';
import { ILogicFields } from '../../types';
import CustomTitle from '../title.vue';
import FieldSelector from './field-selector.vue';
const props = withDefaults(
  defineProps<{
    fieldParams?: ILogicFields;
    field?: ILogicField; // 兼容老写法，与 fieldParams 二选一
    formula: Formula | null;
    isCascade?: boolean; // 兼容老写法
  }>(),
  {
    isCascade: undefined,
  }
);

const { fieldParams } = toRefs(props);
const currentNav = ref<LogicFieldType>(LogicFieldType.serviceParam);
const fieldCascade = computed(() => {
  return props.isCascade === undefined ? props.fieldParams!.params.isCascade : props.isCascade;
});

const field = computed(() => {
  return props.field === undefined ? props.fieldParams!.params.fields : props.field;
});

const initNavList = [
  {
    label: '服务参数',
    value: LogicFieldType.serviceParam,
  },
  {
    label: '全局变量',
    value: LogicFieldType.globalParam,
  },
  {
    label: '系统变量',
    value: LogicFieldType.systemParam,
  },
];

const navList = computed(() => {
  return props.fieldParams?.navList ? props.fieldParams?.navList : initNavList;
});

const fieldTreeRef = ref<InstanceType<typeof FieldSelector>>();
const keySearch = ref<string>('');
const onFieldSearch = (val: string) => {
  fieldTreeRef.value?.filter(val);
};
const changeNav = () => {
  nextTick(() => {
    keySearch.value = '';
  });
};

const fieldClickHandler = (data: any, node: any) => {
  const ret = [];
  while (node.parent) {
    ret.unshift(node.data.prop);
    node = node.parent;
  }
  insertLogicField(props.formula!, ret);
};

defineOptions({
  name: 'logic-selector',
});
</script>

<style scoped lang="scss">
.container {
  height: 274px;
  width: 300px;
  overflow: hidden;
  border: 1px solid var(--border-color-3);
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

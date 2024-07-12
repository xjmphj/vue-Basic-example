<template>
  <custom-title desc="参数：" />
  <div class="container">
    <top-nav :navList="navList" v-model:current="currentNav" @change="onNavChange" />
    <div class="search-container">
      <search-input
        placeholder="请输入"
        v-model="keySearch"
        :realTime="true"
        @searchClick="onSearch"
      />
      <el-scrollbar class="scroll-container" height="194px">
        <widget-selector
          v-show="currentNav === FieldTypeEnum.widget"
          :field-params="fieldParams"
          :formula="formula"
          ref="widgetSelectorRef"
        />
        <variable-selector
          v-show="currentNav === FieldTypeEnum.variable"
          :field-params="fieldParams"
          :formula="formula"
          ref="variableSelectorRef"
        />

        <template-selector
          v-show="currentNav === FieldTypeEnum.template"
          :field-params="fieldParams"
          :formula="formula"
          ref="templateSelectorRef"
        />
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { FieldTypeEnum } from '@develop/views/custom-page/design/types/type';
import { ref, toRefs } from 'vue';
import TopNav from '../logic-selector/nav.vue';
import Formula from '../../utils/Formula';
import { IPageFields } from '../../types';
import CustomTitle from '../title.vue';
import WidgetSelector from './widget-selector.vue';
import TemplateSelector from './template-selector.vue';
import VariableSelector from './variable-selector.vue';
const props = defineProps<{
  fieldParams: IPageFields;
  formula: Formula | null;
}>();

const currentNav = ref<FieldTypeEnum>(FieldTypeEnum.widget);
const navList = [
  {
    label: '页面控件',
    value: FieldTypeEnum.widget,
  },
  {
    label: '页面变量',
    value: FieldTypeEnum.variable,
  },
  {
    label: '数据绑定模板',
    value: FieldTypeEnum.template,
  },
];
const widgetSelectorRef = ref<InstanceType<typeof WidgetSelector>>();
const templateSelectorRef = ref<InstanceType<typeof TemplateSelector>>();
const variableSelectorRef = ref<InstanceType<typeof VariableSelector>>();
const keySearch = ref('');
const { fieldParams, formula } = toRefs(props);
const onSearch = (val: string) => {
  if (currentNav.value === FieldTypeEnum.widget) {
    widgetSelectorRef.value?.filter(val);
  } else if (currentNav.value === FieldTypeEnum.template) {
    templateSelectorRef.value?.filter(val);
  } else if (currentNav.value === FieldTypeEnum.variable) {
    variableSelectorRef.value?.filter(val);
  }
};
const onNavChange = () => {
  widgetSelectorRef.value?.filter(keySearch.value);
};
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

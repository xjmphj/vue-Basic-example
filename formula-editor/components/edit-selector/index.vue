<template>
  <custom-title desc="参数：" />
  <div class="edit-container">
    <top-nav :navList="navList" />
    <div class="search-container">
      <search-input placeholder="请输入" v-model="keySearch" :realTime="true" />
      <el-scrollbar class="scroll-container" height="194px">
        <ul v-show="currentNav === FieldTypeEnum.variable">
          <li
            v-for="item in filterVariableList"
            class="field-item-variable"
            :key="item.value"
            @click="handleClick(item)"
          >
            {{ item.label }}
          </li>
        </ul>
      </el-scrollbar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IEditExpression } from '@develop/views/page-setup/selector-designer/type.d';
import { FieldTypeEnum } from '@develop/views/custom-page/design/types/type';
import { computed, ref } from 'vue';
import TopNav from './nav.vue';
import Formula from '../../utils/Formula';
import { IEditSelectorFields } from '../../types';
import { insertEditField } from '../../hooks/use-cm';
import CustomTitle from '../title.vue';

const props = defineProps<{
  fieldParams: IEditSelectorFields;
  formula: Formula | null;
}>();
// const EMPTY_NODE = 'EMPTY_NODE';
const currentNav = ref<FieldTypeEnum>(FieldTypeEnum.variable);
const navList = [
  //   {
  //     label: '页面控件',
  //     value: FieldTypeEnum.widget,
  //   },
  {
    label: '页面变量',
    value: FieldTypeEnum.variable,
  },
  //   {
  //     label: '数据绑定模板',
  //     value: FieldTypeEnum.template,
  //   },
];
const keySearch = ref('');
const variableList = computed(() => {
  return props.fieldParams.params.fields[FieldTypeEnum.variable].map(
    (item: { label: any; value: any }) => {
      return {
        label: item.label,
        value: item.value,
        props: {
          label: item.label,
          value: item.value,
          paramType: FieldTypeEnum.variable,
        },
      };
    }
  );
});
const filterVariableList = computed(() => {
  if (currentNav.value === FieldTypeEnum.variable) {
    return variableList.value.filter((item: { label: string | string[] }) =>
      item.label.includes(keySearch.value)
    );
  } else {
    return variableList.value;
  }
});

const handleClick = (item: { props: IEditExpression['config'][number] }) => {
  insertEditField(props.formula!, [item.props]);
};
</script>

<style scoped lang="scss">
.edit-container {
  height: 274px;
  width: 300px;
  box-sizing: border-box;
  overflow: hidden;
  border-radius: 2px;
  border: 1px solid var(--border-color-lighten);
  :deep() {
    .nav {
      border: none;
    }
  }
  .search-container {
    padding: 12px 12px 0;
    .scroll-container {
      margin-top: 4px;
    }
  }
}
</style>
<style lang="scss" scoped>
.field-item-variable {
  display: flex;
  width: 100%;
  line-height: 36px;
  color: #3e4754;
  cursor: pointer;
  font-size: 12px;
}
</style>

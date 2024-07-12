<template>
  <el-dialog
    v-model="dialogVisible"
    :title="title"
    :width="821"
    class="formula-dialog logic"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="onBeforeClose"
    @opened="onOpened"
  >
    <div class="formula logic" :class="{ error: !!errorTips }">
      <div class="editor">
        <div class="editor-textarea" ref="codeContainer"></div>
        <div class="error_tips">{{ errorTips }}</div>
      </div>
    </div>
    <div class="options logic">
      <div class="filed opt_item">
        <field-widget :field-params="fieldParams" :formula="formula" />
      </div>
      <div class="function opt_item">
        <div class="option_title">选择函数：</div>
        <search-input
          class="fn-search"
          v-model="funcSearchKey"
          :realTime="true"
          @searchClick="onFuncSearch"
          placeholder="请输入"
        />
        <div class="opt_content no_radius">
          <div class="content_scroll">
            <el-tree
              :data="functionCategoryList"
              :props="funcTreeProps"
              :filter-node-method="funcFilterMethod"
              @node-click="functionClickHandler"
              ref="funcTreeRef"
            >
              <template #="{ node, data }">
                <div @mouseenter="funcMouseEnter(node, data)" @mouseleave="funcMouseLeave()">
                  {{ data[funcTreeProps.label] }}
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </div>
      <div class="opt_item function_example">
        <div class="option_title">选择示例：</div>
        <div class="opt_content">
          <div class="content_scroll func_desc">{{ funcDesc }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button @click="ensure" type="primary">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { FieldParams, FormulaValueType } from './types';
import { IFuncRetDataItem, IFunctionItem, handleFunctionList } from './hooks/use-functions';
import { useSearch } from './hooks/use-operate';
import FieldWidget from './components/field-widget.vue';
import { IValueTokenItem } from './utils/Formula';
import { preProcessValue, processValue } from './hooks/use-formula-config-v2';
import { useCm, insertFunction } from './hooks/use-cm';
import { valuePreProcess2Backend } from './utils/value-pre-process';

const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    placeholder?: string;
    fieldParams: FieldParams;
    functions: IFuncRetDataItem[];
    updatedFormulaConfig?: IValueTokenItem[];
    formulaConfig?: FormulaValueType | null | undefined;
    required?: boolean;
  }>(),
  {
    title: '表达式编辑',
    placeholder: '请单击字段或函数选入编辑框，也可以直接输入常量及+-*/（）运算符',
    required: false,
  }
);

const emits = defineEmits<{
  (e: 'cancel'): void;
  (e: 'ensure', val: FormulaValueType): void;
  (e: 'opened'): void;
  (e: 'update:visible', val: boolean): void;
}>();

const { title, fieldParams, functions, formulaConfig, placeholder } = toRefs(props);

const {
  functionCategoryList,
  functionValueMap,
  functionLabelMap,
  functionList,
  functionLabelList,
} = handleFunctionList(functions);

const realValue = computed(() => {
  if (props.updatedFormulaConfig) {
    return props.updatedFormulaConfig;
  } else if (formulaConfig) {
    return processValue(preProcessValue(formulaConfig, fieldParams), { functionValueMap }).value;
  } else {
    return [];
  }
});
const { codeContainer, initCodeMirror, formula, errorTips } = useCm({
  functionLabelMap,
  functionList,
  functionLabelList,
});
const onOpened = () => {
  emits('opened');
  initCodeMirror(realValue.value, placeholder.value);
};
const {
  treeRef: funcTreeRef,
  onSearch: onFuncSearch,
  searchKey: funcSearchKey,
  filterMethod: funcFilterMethod,
  treeProps: funcTreeProps,
} = useSearch();

const functionClickHandler = (data: any, node: any) => {
  if (node.isLeaf) {
    insertFunction(formula.value!, data);
  }
};

// todo 封装成hooks
const funcDesc = ref<string>('');
const funcMouseEnter = (node: any, data: IFunctionItem) => {
  if (node.isLeaf) {
    funcDesc.value = data.desc;
  }
};
const funcMouseLeave = () => {
  funcDesc.value = '';
};

const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emits('update:visible', val);
  },
});

const onBeforeClose = async (done: (cancel?: boolean) => void) => {
  await formula.value?.setValue([]);
  errorTips.value = '';
  done();
};
const cancel = () => {
  onBeforeClose((cancel = false) => {
    dialogVisible.value = cancel;
  });
};

const ensure = () => {
  const ret = formula.value?.getValue(true, { required: props.required });
  if (ret && ret.valid) {
    const formulaConfig = ret.result!.formulaConfig;
    if (typeof valuePreProcess2Backend[fieldParams.value.type] === 'function') {
      emits(
        'ensure',
        valuePreProcess2Backend[fieldParams.value.type](formulaConfig, fieldParams.value)
      );
    } else {
      emits('ensure', formulaConfig as FormulaValueType);
    }
    cancel();
  }
};

defineOptions({
  name: 'formula-dialog-v2',
});
</script>

<style scoped lang="scss">
@import './style/scope.scss';
</style>
<style lang="scss">
@import './style/global.scss';
</style>

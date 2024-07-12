<template>
  <el-dialog
    v-model="modalVisible"
    :title="title"
    :width="isNewStyle ? 821 : 800"
    @opened="onOpened"
    @open="emits('open')"
    @close="onClose"
    @closed="emits('closed')"
    class="formula-dialog"
    :class="{ logic: isNewStyle }"
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="onBeforeClose"
  >
    <slot name="top"></slot>
    <div class="formula" :class="{ logic: isNewStyle, error: !!errorTips }">
      <div class="editor">
        <div class="editor-textarea" ref="codeContainer"></div>
        <div class="error_tips">{{ errorTips }}</div>
      </div>
    </div>
    <div class="options" :class="{ logic: isNewStyle }">
      <div class="filed opt_item">
        <template v-if="isLogic">
          <div class="option_title">参数：</div>
          <logic-selector
            v-if="logicFields"
            :isCascade="isCascade"
            :field="logicFields"
            :formula="formula"
          />
        </template>
        <!-- <template v-else-if="fieldParams?.type === FiledTypeEnum.page">
          <div class="option_title">参数：</div>
          <custom-page-selector
            v-if="customPageFields"
            :field="customPageFields"
            :formula="formula"
          />
        </template> -->
        <template v-else>
          <div class="option_title">选择字段：</div>
          <search-input
            v-model="fieldSearchKey"
            @searchClick="onFieldSearch"
            :realTime="true"
            placeholder="请输入"
          />
          <div class="opt_content no_radius">
            <div class="content_scroll">
              <el-tree
                :data="fields"
                :props="fieldTreeProps"
                node-key="code"
                :filter-node-method="fieldFilterMethod"
                @node-click="fieldClickHandler"
                ref="fieldTreeRef"
                v-bind="cascadeTreeProps"
              />
            </div>
          </div>
        </template>
      </div>
      <div class="function opt_item">
        <div class="option_title">选择函数：</div>
        <search-input
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
import { computed, ref, Ref, toRefs } from 'vue';
import { useSearch } from './hooks/use-operate';
import { IFuncRetDataItem, IFunctionItem } from './hooks/use-functions';
import { handleFunctionList } from './hooks/use-functions';
import { getFieldList, getFieldMap } from './hooks/use-fields';
import { insertField, insertFunction, useCm } from './hooks/use-cm';
import { ElMessage } from 'element-plus';
import MessageInfo from '@/components/svg-icon/message-info.vue';
import { IValueType, useFormulaConfig, type FormulaItem } from './hooks/use-formula-config';
import { useCascadeData } from '@/views/convert-rules/components/input-condition/use-cascade-data';
import { IValueTokenItem } from './utils/Formula';
import LogicSelector from './components/logic-selector/index.vue';
import { ILogicField } from './components/logic-selector/type';
import { FieldParams, fieldTypeAsset, FiledTypeEnum, ILogicFields } from './types';
// import CustomPageSelector from './components/custom-page-selector/index.vue';

const props = withDefaults(
  defineProps<{
    title?: string;
    visible: boolean;
    placeholder?: string;
    fields?: any[];
    nodeKey?: string;
    treeProps?: any;
    functions: IFuncRetDataItem[];
    value?: string;
    ensureCloseDialog?: boolean;
    oneModelField?: boolean;
    beforeClose?: () => void;
    required?: boolean;
    isCascade?: boolean;
    updatedFormulaConfig?: IValueTokenItem[];
    formulaConfig?: FormulaItem[];
    isLogic?: boolean;
    logicFields?: ILogicField;
    fieldParams?: FieldParams;
  }>(),
  {
    placeholder: '请单击字段或函数选入编辑框，也可以直接输入常量及+-*/（）运算符',
    title: '编辑函数',
    ensureCloseDialog: true,
    oneModelField: false,
    required: true,
    isCascade: false,
    isLogic: false,
    fields: () => [],
    nodeKey: 'value',
  }
);
const emits = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'ensure', val: string): void;
  (e: 'open'): void;
  (e: 'opened'): void;
  (e: 'close'): void;
  (e: 'closed'): void;
  (e: 'ensure:formulaConfig', config: FormulaItem[]): void;
}>();
const {
  title,
  fields,
  nodeKey,
  treeProps,
  functions,
  value,
  // tokens,
  placeholder,
  ensureCloseDialog,
  oneModelField,
  beforeClose,
  formulaConfig,
  updatedFormulaConfig,
  isCascade: isCascadeWillDel,
  isLogic: isLogicWillDel,
  fieldParams,
  logicFields: logicFieldsWillDel,
} = toRefs(props);

defineOptions({
  name: 'formula-editor',
});
// 兼容老版本写法，待优化
const isLogic = computed(() => {
  if (fieldParams?.value) {
    return fieldParams.value.type === FiledTypeEnum.logic;
  } else {
    return isLogicWillDel.value;
  }
});
const isNewStyle = computed(() => {
  if (fieldParams?.value) {
    return [FiledTypeEnum.logic, FiledTypeEnum.page].includes(fieldParams?.value.type);
  } else {
    return isLogic.value;
  }
});
// 兼容老版本写法，待优化
const logicFields = computed(() => {
  if (fieldParams?.value) {
    if (fieldTypeAsset<ILogicFields>(fieldParams.value, FiledTypeEnum.logic)) {
      return fieldParams.value.params.fields;
    } else {
      return [];
    }
  } else {
    return logicFieldsWillDel?.value;
  }
});

// const customPageFields = computed(() => {
//   if (fieldParams?.value && fieldTypeAsset<IPageFields>(fieldParams.value, FiledTypeEnum.page)) {
//     return fieldParams.value.params;
//   }
//   return null;
// });
// 兼容老版本写法，待优化
const isCascade = computed(() => {
  if (fieldParams?.value) {
    if (fieldTypeAsset<ILogicFields>(fieldParams.value, FiledTypeEnum.logic)) {
      return fieldParams.value.params.isCascade;
    } else {
      return false;
    }
  } else {
    return isCascadeWillDel.value;
  }
});
const modalVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emits('update:visible', val);
  },
});

const modelLevel = (unionCode: string) => {
  return unionCode.split('.').length - 1;
};
const funcDesc = ref<string>('');
// 只考虑需要选择一个模型中的字段的情况
const modelCodes = computed(() => {
  if (oneModelField.value) {
    const codes: string[] = [];
    fields.value.forEach((item) => {
      if (modelLevel(item[nodeKey.value]) > 0) {
        // 直接是主，子孙模型平铺
        codes.push(item[nodeKey.value]);
      } else {
        const fields = item[treeProps.value.children];
        if (!Array.isArray(fields)) {
          return;
        }
        const isSingle = fields.every((o) => {
          // 是否单模型
          return o.fieldType !== undefined;
        });
        if (isSingle) {
          codes.push(item[nodeKey.value]);
        } else {
          // 组合模型，然后平铺主子孙模型
          codes.push(...fields.map((o) => o[nodeKey.value]));
        }
      }
    });
    // 按照孙 -> 子 -> 主 排序
    return codes.sort((o1, o2) => {
      return o2.split('.').length - o1.split('.').length;
    });
  } else {
    return [];
  }
});
const modelCodesReg = computed(() => {
  return modelCodes.value.map((item) => {
    return new RegExp(`^${item.replaceAll('.', '\\.')}`);
  });
});

const computedFieldProps = computed(() => {
  if (isCascade.value) {
    return {
      ...treeProps.value,
      isLeaf: (data: any) => {
        if (Array.isArray(data[treeProps.value.children])) {
          return false;
        } else if (
          (data.dataSource && data.fieldType == 'single_ref') ||
          data.fieldType === 'model_ref' ||
          data.fieldType === 'dict'
        ) {
          return false;
        } else {
          return true;
        }
      },
    };
  } else {
    return treeProps.value;
  }
});
const funcMouseEnter = (node: any, data: IFunctionItem) => {
  if (node.isLeaf) {
    funcDesc.value = data.desc;
  }
};
const funcMouseLeave = () => {
  funcDesc.value = '';
};
const {
  functionCategoryList,
  functionValueMap,
  functionLabelMap,
  functionList,
  functionLabelList,
} = handleFunctionList(functions);

const {
  treeRef: fieldTreeRef,
  onSearch: onFieldSearch,
  searchKey: fieldSearchKey,
  filterMethod: fieldFilterMethod,
  treeProps: fieldTreeProps,
} = useSearch(computedFieldProps.value);

const {
  treeRef: funcTreeRef,
  onSearch: onFuncSearch,
  searchKey: funcSearchKey,
  filterMethod: funcFilterMethod,
  treeProps: funcTreeProps,
} = useSearch();
const { getModelData, getDicData } = useCascadeData({
  fieldIsCascade: isCascade.value,
  label: fieldTreeProps.label,
});
const loadNode = async (node: any, resolve: (data: any[]) => void) => {
  if (node.level == 0) {
    resolve(fields.value);
  } else if (node.data[fieldTreeProps.children]) {
    resolve(node.data[fieldTreeProps.children]);
  } else if (node.data?.unionCode.indexOf(`${node.data?.dataSource}`) > -1) {
    // 有循环引用的时候不进行下级展示
    resolve([]);
  } else if (
    (node.data?.dataSource &&
      node.data?.dataSourceType == 'model' &&
      node.data.fieldType == 'single_ref') ||
    node.data.fieldType === 'model_ref'
  ) {
    const newSourceFields = await getModelData(node);
    node.data[fieldTreeProps.children] = newSourceFields;
    resolve(newSourceFields);
  } else if (
    (node.data?.dataSource &&
      node.data?.dataSourceType == 'dict' &&
      node.data.fieldType == 'single_ref') ||
    node.data.fieldType === 'dict'
  ) {
    const newSourceFields = await getDicData(node);
    node.data[fieldTreeProps.children] = newSourceFields;
    resolve(newSourceFields);
  } else {
    resolve([]);
  }
};

const fieldList = computed(() => {
  return getFieldList(fields.value, treeProps.value);
});
const fieldMap = computed(() => {
  return getFieldMap(fieldList.value, nodeKey.value);
});

const formulaValue = computed(() => {
  const formulaValue: IValueType = {};
  if (updatedFormulaConfig && updatedFormulaConfig.value !== undefined) {
    formulaValue.updatedFormulaConfig = updatedFormulaConfig as Ref<IValueTokenItem[]>;
  } else if (formulaConfig && formulaConfig.value !== undefined) {
    formulaValue.formulaConfig = formulaConfig as Ref<FormulaItem[]>;
  } else if (value && value.value !== undefined) {
    formulaValue.value = value as Ref<string>;
  }
  return formulaValue;
});

const realValue = useFormulaConfig(formulaValue, { treeProps, fieldMap, functionValueMap });

const cascadeTreeProps = computed(() => {
  if (isCascade.value) {
    return {
      expandOnClickNode: false,
      checkStrictly: true,
      load: loadNode,
      lazy: true,
    };
  } else {
    return {};
  }
});
const onOpened = () => {
  emits('opened');
  initCodeMirror(realValue.value, placeholder.value);
  // selectedModels.value = [];
};

const onClose = () => {
  fieldSearchKey.value = '';
  onFieldSearch();
  funcSearchKey.value = '';
  onFuncSearch();
  emits('close');
};
// 初始化codeMirror
const { codeContainer, initCodeMirror, formula, errorTips } = useCm({
  functionLabelMap,
  functionList,
  functionLabelList,
});

const clickCascadeField = (data: any, node: any, treeNode: unknown, event: PointerEvent) => {
  // 第一层不需要选中，点击应该expand子级
  if (node.level === 1) {
    const dom = (event.target as HTMLElement).parentNode?.querySelector(
      'i.el-icon.el-tree-node__expand-icon'
    ) as HTMLElement;
    dom?.click();
    return;
  }
  if (data.disabled || !fieldCanSelect(data)) {
    return;
  }
  insertField(formula.value!, data[treeProps.value.label], data[nodeKey.value], data);
};

const clickNoCascadeField = (data: any, node: any) => {
  if (node.isLeaf && !data.disabled && fieldCanSelect(data)) {
    insertField(formula.value!, data[treeProps.value.label], data[nodeKey.value], data);
  }
};

const getModelCodeByUnionCode = (code: string) => {
  for (const reg of modelCodesReg.value) {
    const matched = code.match(reg);
    if (matched) {
      return matched[0];
    }
  }
  return undefined;
};

const fieldCanSelect = (data: any) => {
  if (oneModelField.value) {
    // 先获取目前引用了哪些字段
    // 再判断是否有重复
    const selected = (formula.value?.getFieldModelCodes() || [])
      .map((item) => {
        return getModelCodeByUnionCode(item);
      })
      .filter(Boolean);
    const current = getModelCodeByUnionCode(data[nodeKey.value]);
    if (selected.length > 0 && !selected.includes(current)) {
      ElMessage({
        type: 'info',
        icon: MessageInfo,
        message: '只能选择同一个模型',
      });
      return false;
    }
    return true;
  }
  return true;
};

const fieldClickHandler = (data: any, node: any, treeNode: unknown, event: PointerEvent) => {
  if (isCascade.value) {
    clickCascadeField(data, node, treeNode, event);
  } else {
    clickNoCascadeField(data, node);
  }
};
const functionClickHandler = (data: any, node: any) => {
  if (node.isLeaf) {
    insertFunction(formula.value!, data);
  }
};
const cancel = () => {
  onBeforeClose((cancel = false) => {
    emits('update:visible', cancel);
  });
};
const ensure = () => {
  const ret = formula.value?.getValue(true, { required: props.required });
  if (ret && ret.valid) {
    if (ensureCloseDialog.value) {
      cancel();
    }

    emits('ensure:formulaConfig', ret.result!.formulaConfig);
    if (isLogic.value) {
      emits('ensure', JSON.stringify({ elements: ret.result!.formulaConfig }));
    } else {
      emits('ensure', ret.result!.value);
    }
  }
};
const onBeforeClose = async (done: (cancel?: boolean) => void) => {
  beforeClose?.value && (await beforeClose.value());
  await formula.value?.setValue([]);
  errorTips.value = '';
  done();
};
</script>

<style scoped lang="scss">
@import './style/scope.scss';
</style>
<style lang="scss">
@import './style/global.scss';
</style>

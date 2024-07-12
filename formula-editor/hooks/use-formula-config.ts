// 处理历史数据的兼容问题
// 历史数据传递的是value或者tokens
// 新的数据结构传递的是formulaConfig和updatedFormulaConfig
// 其中formulaConfig为保存到后端的值，updatedFormulaConfig为调用接口后更新了fieldName的数据结构
// type formulaConfigType = 'separator' | 'functionName' |
import { IValueTokenItem } from '../utils/Formula';
import { computed, ComputedRef, type Ref } from 'vue';
import { FormulaTypes, TYPES } from '../config';
import { parseTokens, getTokens } from '../utils/tokens';
import { getLogicLabel } from './use-cm';
import { IExpression } from '@develop/views/custom-page/design/types/type';
import { IOptions } from './use-formula-config-v2';
import { LogicExpressionItem } from '../components/logic-selector/type';

// interface IFieldItem {
//   type: 'functionField';
//   config: any; // TODO config的
// }
// interface IFunctionItem {
//   type: 'separator' | 'functionName' | 'constant';
//   value: string;
// }

export interface FormulaItem {
  type: FormulaTypes;
  value?: string;
  label?: string;
  config?: any;
  logicVariables?: LogicExpressionItem[];
}

export interface IValueType {
  value?: Ref<string>;
  tokens?: Ref<IValueTokenItem[]>;
  formulaConfig?: Ref<FormulaItem[]>;
  updatedFormulaConfig?: Ref<IValueTokenItem[]>;
  logicFormulaConfig?: Ref<any>;
  customPageConfig?: Ref<IExpression>;
}

const formatFormulaConfig = (
  formulaConfig: FormulaItem[],
  options: IOptions
): IValueTokenItem[] => {
  const temp: IValueTokenItem[] = [];
  const { functionValueMap } = options;
  for (const item of formulaConfig) {
    if (item.type === FormulaTypes.FUNCTION_FIELD) {
      temp.push({
        type: TYPES.field,
        label: item.config.fieldName,
        value: item.config.value, // TODO 暂时定为value
        config: item.config,
      });
    } else if (item.type === FormulaTypes.FUNCTION_LOGIC_VARIABLE) {
      temp.push({
        type: TYPES.logic_field,
        label: getLogicLabel(item.logicVariables!, true),
        value: getLogicLabel(item.logicVariables!, false),
        config: item.logicVariables,
      });
    } else if (item.type === FormulaTypes.CUSTOM_PAGE_VARIABLE) {
      temp.push({
        type: TYPES.custom_page,
        label: item.config.map((item: any) => item.label).join('.'),
        value: item.config[item.config.length - 1].value,
        config: item.config,
      });
    } else if (item.type === FormulaTypes.EDIT_SELECTOR_VARIABLE) {
      temp.push({
        type: TYPES.edit_selector,
        label: item.config.map((item: any) => item.label).join('.'),
        value: item.config[item.config.length - 1].value,
        config: item.config,
      });
    } else if (item.type === FormulaTypes.FUNCTION_NAME) {
      if (Object.keys(functionValueMap.value).length === 0) return [];
      temp.push({
        type: TYPES.function,
        label: functionValueMap.value[item.value!].label,
        value: item.value!,
      });
    } else if (item.type === FormulaTypes.CONSTANT || item.type === FormulaTypes.SEPARATOR) {
      const tokens = parseTokens(item.value!);
      for (const o of tokens) {
        temp.push({
          type: o.type,
          value: o.field,
          label: o.field,
        });
      }
    }
  }
  return temp;
};

const tokens2FormulaConfig = (tokens: IValueTokenItem[], options: IOptions): IValueTokenItem[] => {
  return tokens.map((item) => {
    if (item.type === TYPES.field) {
      const field = options.fieldMap!.value[item.value] || {};
      return {
        ...item,
        config: {
          type: 3,
          fieldCode: field.fieldCode,
          modelCode: field.modelCode,
          parentRef: field.parentRef,
        },
      };
    }
    return item;
  });
};

export const useFormulaConfig = (formulaValue: ComputedRef<IValueType>, options: IOptions) => {
  const data = computed(() => {
    const {
      value,
      tokens,
      formulaConfig,
      updatedFormulaConfig,
      logicFormulaConfig,
      customPageConfig,
    } = formulaValue.value;
    if (updatedFormulaConfig?.value !== undefined && updatedFormulaConfig?.value !== null) {
      return updatedFormulaConfig.value;
    }
    if (logicFormulaConfig && logicFormulaConfig.value !== undefined) {
      let data = logicFormulaConfig.value;
      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch (e) {
          data = { elements: [] };
        }
      }
      return formatFormulaConfig(data.elements || [], options);
    }
    if (customPageConfig && customPageConfig.value !== undefined) {
      return formatFormulaConfig(customPageConfig.value, options);
    }
    if (formulaConfig?.value !== undefined && formulaConfig?.value !== null) {
      return formatFormulaConfig(formulaConfig.value, options);
    }
    if (tokens?.value !== undefined) {
      return tokens2FormulaConfig(tokens.value, options);
    }
    if (value?.value) {
      // 页面设计时，用户删除公式计算依赖字段
      const target = parseTokens(value.value);
      let isDel = false;
      target.forEach((data) => {
        if (data.type === 'field') {
          if (!options.fieldMap!.value[data.field]) {
            isDel = true;
          }
        }
      });
      if (isDel) {
        return [];
      }
      return tokens2FormulaConfig(
        getTokens(
          value.value,
          options.fieldMap!.value,
          options.functionValueMap.value,
          options.treeProps!.value
        ),
        options
      );
    }
    return [];
  });
  return data;
};

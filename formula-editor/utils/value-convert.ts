import { FormulaTypes, TYPES } from '../config';
import { getLogicLabel } from '../hooks/use-cm';
import { FormulaItem } from '../hooks/use-formula-config';
import { IValueTokenItem } from './Formula';

// 模型字段，如转换规则等地方
const field2Front = (value: FormulaItem) => {
  return {
    type: TYPES.field,
    label: value.config.fieldName,
    value: value.config.value,
    config: value.config,
  };
};

const field2Backend = (data: IValueTokenItem) => {
  return {
    type: FormulaTypes.FUNCTION_FIELD,
    config: data.config,
  };
};

// 逻辑编排字段
const logicField2Front = (value: FormulaItem) => {
  return {
    type: TYPES.logic_field,
    label: getLogicLabel(value.logicVariables!, true),
    value: getLogicLabel(value.logicVariables!, false),
    config: value.logicVariables,
  };
};
export const logicField2Backend = (data: IValueTokenItem) => {
  return {
    type: FormulaTypes.FUNCTION_LOGIC_VARIABLE,
    logicVariables: data.config,
  };
};

// 自定义页面的字段
const customPageField2Front = (value: FormulaItem) => {
  return {
    type: TYPES.custom_page,
    label: value.config.map((item: any) => item.label).join('.'),
    value: value.config[value.config.length - 1].value,
    config: value.config,
  };
};
// 可编辑选择器的字段
const editSelectorField2Front = (value: FormulaItem) => {
  return {
    type: TYPES.edit_selector,
    label: value.config.map((item: any) => item.label).join('.'),
    value: value.config[value.config.length - 1].value,
    config: value.config,
  };
};
const customPageField2Backend = (data: IValueTokenItem) => {
  return {
    type: FormulaTypes.CUSTOM_PAGE_VARIABLE,
    config: data.config,
  };
};
const editSelectorField2Backend = (data: IValueTokenItem) => {
  return {
    type: FormulaTypes.EDIT_SELECTOR_VARIABLE,
    config: data.config,
  };
};

export const valueConvert2Front = {
  [FormulaTypes.FUNCTION_FIELD]: field2Front,
  [FormulaTypes.FUNCTION_LOGIC_VARIABLE]: logicField2Front,
  [FormulaTypes.CUSTOM_PAGE_VARIABLE]: customPageField2Front,
  [FormulaTypes.EDIT_SELECTOR_VARIABLE]: editSelectorField2Front,
};

export const valueConvert2Backend = {
  [TYPES.logic_field]: logicField2Backend,
  [TYPES.edit_selector]: editSelectorField2Backend,
  [TYPES.custom_page]: customPageField2Backend,
  [TYPES.field]: field2Backend,
};

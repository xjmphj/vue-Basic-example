export enum TYPES {
  operation = 'operation',
  bracket = 'bracket',
  function = 'function',
  space = 'space',
  field = 'field',
  digital = 'digital',
  unknown = 'unknown',
  comma = 'comma',
  logic_field = 'logic_field',
  custom_page = 'custom_page',
  edit_selector = 'edit_selector',
}

export enum FormulaTypes {
  SEPARATOR = 'SEPARATOR',
  FUNCTION_NAME = 'FUNCTION_NAME',
  FUNCTION_FIELD = 'FUNCTION_FIELD',
  CONSTANT = 'CONSTANT',
  FUNCTION_LOGIC_VARIABLE = 'FUNCTION_LOGIC_VARIABLE',
  CUSTOM_PAGE_VARIABLE = 'CUSTOM_PAGE_VARIABLE',
  EDIT_SELECTOR_VARIABLE = 'EDIT_SELECTOR_VARIABLE',
}

export const aggregateFunctions = ['aggregateWithSum'];
export const FUNCTION_NAME_PREFIX = 'front'; // 前端解析公式过程中需要使用一些自定义的函数，函数名均以 front 开头，避免和后端定义的函数名冲突
export const CALC_VALUE_BY_CODE = `calcValueByFieldCode`;
export const CALC_AGGREGATE_VALUE = `calcAggregateValueByFieldCode`;

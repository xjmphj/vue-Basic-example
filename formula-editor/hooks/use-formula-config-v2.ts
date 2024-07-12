import { Ref, computed } from 'vue';
import { FormulaItem } from './use-formula-config';
import { FunctionMapType } from './use-functions';
import { IValueTokenItem } from '../utils/Formula';
import { FormulaTypes, TYPES } from '../config';
import { parseTokens } from '../utils/tokens';
import { FieldParams, FormulaValueType } from '../types';
import { valuePreProcess2FrontMap } from '../utils/value-pre-process';
import { valueConvert2Front } from '../utils/value-convert';
export interface IOptions {
  functionValueMap: Ref<FunctionMapType>;
  fieldMap?: Ref<Record<string, any>>;
  treeProps?: Ref<any>;
}

// 数据转换
// 将后端的数据格式，转换为前端解析需要的格式
// 1. 将 FormulaType 类型 对应到 TYPES 类型，由于历史原因，两边的类型并不是完全一致
// 2. 不同的需求，定义的数据格式并不是完全一样，统一对数据格式化为  {type,label,value,config?}
// label：为字段在公式中显示的名称
// value: 字段实际对应的code 或id ,一般存在config时，config里面一般包含了value的信息，此时value意义不大
// config: 某些复杂的字段，仅仅通过一个value无法描述，所以增加一个对象对齐描述
export const convert = (formulaConfig: FormulaItem[], options: IOptions) => {
  const temp: IValueTokenItem[] = [];
  const { functionValueMap } = options;
  for (const item of formulaConfig) {
    if (typeof valueConvert2Front[item.type] === 'function') {
      temp.push(valueConvert2Front[item.type](item));
    } else if (item.type === FormulaTypes.FUNCTION_NAME) {
      // 函数字段名
      if (Object.keys(functionValueMap.value).length === 0) return [];
      temp.push({
        type: TYPES.function,
        label: functionValueMap.value[item.value!].label || item.label || '',
        value: item.value!,
      });
    } else if (item.type === FormulaTypes.CONSTANT || item.type === FormulaTypes.SEPARATOR) {
      // + - * /操作符，括号，数值，字符串等
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

export const preProcessValue = (
  formulaConfig: Ref<FormulaValueType | null | undefined>,
  fieldParams: Ref<FieldParams>
) => {
  return computed(() => {
    const value = formulaConfig.value;
    if (value === null || value === undefined) {
      return [];
    }
    const type = fieldParams.value.type;
    // 某些场景与后端约定，可能并不是 FormulaItem的数据格式（如逻辑编排），需要处理成Array<FormulaItem> 的格式
    // 建议与后端约定为Array<FormulaItem>的格式，避免后续麻烦
    // FormulaItem 的格式是指 {type:'自行约定'，[key]：any} // key也是自行约定，建议使用config
    if (typeof valuePreProcess2FrontMap[type] === 'function') {
      return valuePreProcess2FrontMap[type](value, fieldParams.value);
    }
    return value as Array<FormulaItem>;
  });
};

// 将保存的数据格式转化为 公式编辑器内部的格式
// 将 保存的数据的type(FormulaTypes)映射到 公式编辑器内部的 type上(TYPES), 历史原因导致两边类型不一致
// 维护好label,该label就是在表达式编辑器中的文案
// 如果存在config，理论上 value可以不需要维护，也可以给一个唯一值
export const processValue = (formulaConfig: Ref<Array<FormulaItem>>, options: IOptions) => {
  return computed(() => {
    return convert(formulaConfig.value, options);
  });
};

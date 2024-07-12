import { ILogicExpression } from '../components/logic-selector/type';
import { FormulaItem } from '../hooks/use-formula-config';
import { FiledTypeEnum, ILogicFields } from '../types';
const logicValue2Front = (value: ILogicExpression) => {
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value);
    } catch (e) {
      value = { elements: [] };
    }
  }
  return value.elements;
};

const logicValue2Backend = (value: FormulaItem[], fieldParams: ILogicFields) => {
  const data = { elements: value };
  if (fieldParams.params.needString) {
    return JSON.stringify(data);
  }
  return data;
};
export const valuePreProcess2FrontMap = {
  [FiledTypeEnum.logic]: logicValue2Front, // 逻辑编排参数处理
};

export const valuePreProcess2Backend = {
  [FiledTypeEnum.logic]: logicValue2Backend,
};

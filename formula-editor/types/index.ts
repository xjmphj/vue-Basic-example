import { IPageData } from '@develop/views/custom-page/design/types/widget-data.type';
import { ILogicExpression, ILogicField, LogicFieldType } from '../components/logic-selector/type';
import { IEditSelectorField } from '../components/edit-selector/type';
import { IExpression as IEditExpression } from '@develop/views/page-setup/selector-designer/type.d';

import {
  IExpression,
  FieldTypeEnum as VariableTypeEnum,
} from '@dev/views/custom-page/design/types/type';
import { IPageVariable } from '@develop/views/custom-page/design/types/widget-config';
import { IBaseTemplateItem } from '@/api/custom-page/type';
import { PositionDetail } from '@/develop/store/custom-page/extra-params';

export enum FiledTypeEnum {
  model = 'model',
  logic = 'logic',
  page = 'page',
  edit_selector = 'edit_selector',
  custom = 'custom',
}
export interface ILogicFields {
  // 可选字段是逻辑编排的字段是的参数
  type: FiledTypeEnum.logic;
  params: {
    needString?: boolean; // 返回值是否转为string格式
    fields: ILogicField; // 可选的fields
    isCascade?: boolean; // 是否级联
  };
  navList?: {
    // 用户传的分类
    label: string;
    value: LogicFieldType;
  }[];
}
export interface IPageFiledParams {
  [VariableTypeEnum.widget]: IPageData;
  [VariableTypeEnum.variable]: Array<IPageVariable>;
  [VariableTypeEnum.template]: Array<IBaseTemplateItem>;
  [VariableTypeEnum.iteration]?: {
    value: string;
    label: string;
    uuid: string;
    children: Array<{ value: string; label: string }>;
  };
}
export interface IEditSelectorFields {
  type: FiledTypeEnum.edit_selector;
  params: {
    fields: IEditSelectorField;
  };
}
export interface ICustomPageParams {
  fields: IPageFiledParams;
  position: PositionDetail | null;
  rowData: {
    iterationVariable: string;
    fields: Array<IOption>;
  } | null;
  widgetExclude?: string[];
  templateExclude?: string[];
}
export interface IPageFields {
  type: FiledTypeEnum.page;
  params: ICustomPageParams;
}

export interface INavListItem {
  label: string;
  value: string;
  dataList: {
    label: string;
    value: string;
    isLeaf: boolean;
    cantInsert: boolean;
    children: any[];
  }[];
}
// bom 公式赋值和校验
export interface ICustomFields {
  type: FiledTypeEnum.custom;
  navList: INavListItem[];
  lazy?: boolean;
}

export const fieldTypeAsset = <T>(val: any, type: FiledTypeEnum): val is T => {
  return val.type === type;
};

export type FieldParams = ILogicFields | IPageFields | ICustomFields | IEditSelectorFields;

export type FormulaValueType = ILogicExpression | IExpression | IEditExpression;

import { IParameterBase } from '@/store/logic/utils/data-format/parameters';
import { FieldType, ParamScope } from '@develop/views/logic-arrangement/config';
import { FormulaItem } from '../../hooks/use-formula-config';

export type LogicFieldItem = Pick<
  IParameterBase,
  'paramName' | 'paramCode' | 'paramType' | 'generalType' | 'generalRef'
> & { paramScope?: ParamScope };
export interface ILogicFieldItem<T> {
  value: string;
  label: string;
  prop: T;
}

export interface ILogicProp {
  logicVariable: {
    generalRef: string;
    paramCode: string;
    paramName: string;
    paramType: FieldType;
    generalType: string;
  };
  variableType: TreeNodeType.logic;
}

export interface IModelFieldVariable {
  fieldCode: string;
  fieldName?: string;
  fieldType: string;
  modelCode: string;
  refExtInfo?: {
    refCode?: string;
    refType?: string;
  } | null;
}

export interface IModelFieldProp {
  modelFieldVariable: IModelFieldVariable;
  variableType: TreeNodeType.model_field;
}

export interface IModelCascadeFieldProp {
  refVariable: IModelFieldVariable;
  variableType: TreeNodeType.cascade_model;
}

export interface IModelCascadeDicProp {
  refDictOptionVariable: {
    fieldCode: string;
    fieldName?: string;
    refDict: string;
  };
  variableType: TreeNodeType.cascade_dict_option;
}

export interface IViewFieldProp {
  variableType: TreeNodeType.view_field;
  viewFieldVariable: {
    fieldActualAlias: string;
    fieldAlias: string;
    fieldType: string;
    viewCode: string;
  };
}

export enum LogicFieldType {
  serviceParam = 'serviceParam',
  globalParam = 'globalParam',
  systemParam = 'systemParam',
}

export interface ILogicField {
  [LogicFieldType.serviceParam]: LogicFieldItem[];
  [LogicFieldType.globalParam]: LogicFieldItem[];
  [LogicFieldType.systemParam]: LogicFieldItem[];
}

export enum TreeNodeType {
  logic = 'logic', // 逻辑字段
  model_field = 'model_field', // 逻辑字段参数下的模型字段
  cascade_model = 'cascade_model', // 通过模型级联出来的模型字段
  cascade_dict_option = 'cascade_dict_option',
  view_field = 'view_field',
  cascade_user = 'cascade_user',
  cascade_dept = 'cascade_dept',
  cascade_staff = 'cascade_staff',
}
export type LogicExpressionItem =
  | ILogicProp
  | IModelFieldProp
  | IModelCascadeFieldProp
  | IModelCascadeDicProp
  | IViewFieldProp;
export interface ILogicExpression {
  elements: Array<FormulaItem>;
}

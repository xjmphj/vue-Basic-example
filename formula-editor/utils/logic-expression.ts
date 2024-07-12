import { IFieldItem } from '@/api/model/type';
import {
  ILogicProp,
  IModelCascadeDicProp,
  IModelCascadeFieldProp,
  IModelFieldProp,
  IModelFieldVariable,
  IViewFieldProp,
  LogicFieldItem,
  TreeNodeType,
} from '../components/logic-selector/type';
import { NewViewFieldItem } from '@/api/page-setup/ListDesign';
// 逻辑编排字段
export const initLogicProp = (parameter: LogicFieldItem): ILogicProp => {
  return {
    logicVariable: {
      generalRef: parameter.generalRef!,
      paramCode: parameter.paramCode,
      paramName: parameter.paramName,
      paramType: parameter.paramType,
      generalType: parameter.generalType!,
    },
    variableType: TreeNodeType.logic,
  };
};
// 模型字段
export const initModelField = (
  field: IFieldItem,
  variableType: TreeNodeType.cascade_model | TreeNodeType.model_field
): IModelFieldProp | IModelCascadeFieldProp => {
  const modelFieldProp: IModelFieldVariable = {
    fieldCode: field.fieldCode,
    fieldName: field.fieldName,
    fieldType: field.fieldType,
    modelCode: field.modelCode,
    refExtInfo: {
      refCode: field.dataSource,
      refType: field.dataSourceType,
    },
  };
  if (variableType === TreeNodeType.model_field) {
    return {
      variableType,
      modelFieldVariable: modelFieldProp,
    };
  } else {
    return {
      variableType,
      refVariable: modelFieldProp,
    };
  }
};

// 视图字段
export const initViewField = (field: NewViewFieldItem, viewCode: string): IViewFieldProp => {
  return {
    variableType: TreeNodeType.view_field,
    viewFieldVariable: {
      fieldActualAlias: field.viewFieldCode,
      fieldAlias: field.viewFieldAlias,
      fieldType: field.viewFieldType,
      viewCode: viewCode,
    },
  };
};

// 选择单值引用字段，且单值引用的字段指向的是模型，自动增加一个id字段
export const initModelIdField = (modelCode: string): IModelCascadeFieldProp => {
  return {
    refVariable: {
      fieldCode: 'id',
      fieldType: 'number',
      modelCode,
    },
    variableType: TreeNodeType.cascade_model,
  };
};
// 选择单值引用字段，且单值引用的字段指向的是字典，自动增加一个code字段
export const initModelCodeField = (dataSource: string): IModelCascadeDicProp => {
  return {
    refDictOptionVariable: {
      fieldCode: 'code',
      refDict: dataSource,
    },
    variableType: TreeNodeType.cascade_dict_option,
  };
};

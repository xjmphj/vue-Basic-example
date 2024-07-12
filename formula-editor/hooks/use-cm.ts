import CodeMirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/addon/hint/show-hint.css';
import 'codemirror/addon/hint/show-hint';
import 'codemirror/addon/edit/matchbrackets';
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/display/placeholder';
import { ComputedRef, ref, shallowRef } from 'vue';
import { formulaHint } from '../utils/formula-hint';
import Formula, { IValueTokenItem } from '../utils/Formula';
import { FunctionMapType, IFunctionItem } from './use-functions';
import { TreeNodeType } from '../components/logic-selector/type';
import { TYPES } from '../config';
import { IPageExpression } from '@develop/views/custom-page/design/types/type';
import { IEditExpression } from '@develop/views/page-setup/selector-designer/type.d';

export const useCm = ({
  functionLabelMap,
  functionList,
  functionLabelList,
}: {
  functionLabelMap: ComputedRef<FunctionMapType>;
  functionList: ComputedRef<Array<IFunctionItem>>;
  functionLabelList: ComputedRef<Array<string>>;
}) => {
  const codeContainer = ref<HTMLTextAreaElement>();
  const formula = shallowRef<Formula | null>(null);
  let cm: CodeMirror.Editor;
  const errorTips = ref<null | string>(null);
  const initCodeMirror = (tokens: IValueTokenItem[], placeholder: string) => {
    formulaHint(functionLabelList?.value || []);

    cm = CodeMirror(codeContainer.value!, {
      mode: {
        name: 'text/x-formula',
      },
      hintOptions: {
        completeSingle: false,
      },
      matchBrackets: true,
      placeholder,
    });

    formula.value = new Formula(cm);
    formula.value.setFormulaFunction(functionList?.value || []);
    formula.value.functionLabelMap = functionLabelMap?.value || {};
    formula.value.on(formula.value.event.valid, (error: null | string) => {
      errorTips.value = error;
    });

    formula.value?.setValue(tokens);
  };
  return { initCodeMirror, codeContainer, formula, errorTips };
};

export const insertFunction = (formula: Formula, data: IFunctionItem) => {
  formula.insertFunction({ label: data.label, paramsCount: data.paramsCount });
};
export const insertField = (formula: Formula, label: string, value: string, data: any) => {
  const config = {
    type: 3,
    modelCode: data.modelCode,
    fieldCode: data.fieldCode,
    fieldName: data.fieldName,
    fieldType: data.fieldType,
    unionCode: data.unionCode,
    parentRef: data.parentRef,
    fieldSource: data.fieldSource,
    dataSource: data.dataSource,
    dataSourceType: data.dataSourceType,
    value: data.unionCode,
    childRef: data.childRef,
  };
  formula.insertField(label, value, config);
};

export const getLogicLabel = (data: any[], label: boolean) => {
  return data
    .map((d) => {
      if (d.variableType === TreeNodeType.logic) {
        return d.logicVariable[label ? 'paramName' : 'paramCode'];
      } else if (d.variableType === TreeNodeType.model_field) {
        return d.modelFieldVariable[label ? 'fieldName' : 'fieldCode'];
      } else if (d.variableType === TreeNodeType.cascade_model) {
        return d.refVariable[label ? 'fieldName' : 'fieldCode'];
      } else if (d.variableType === TreeNodeType.cascade_dict_option) {
        return d.refDictOptionVariable[label ? 'fieldName' : 'fieldCode'];
      } else if (
        [TreeNodeType.cascade_dept, TreeNodeType.cascade_staff, TreeNodeType.cascade_user].includes(
          d.variableType
        )
      ) {
        return d.refCommonVariable[label ? 'fieldName' : 'fieldCode'];
      } else if (d.variableType === TreeNodeType.view_field) {
        return d.viewFieldVariable[label ? 'fieldAlias' : 'fieldActualAlias'];
        return;
      }
    })
    .filter(Boolean)
    .join('.');
};

export const insertLogicField = (formula: Formula, data: any[]) => {
  const label = getLogicLabel(data, true);
  const value = getLogicLabel(data, false);
  formula.insertField(label, value, data, TYPES.logic_field);
};

export const insertPageField = (formula: Formula, data: IPageExpression['config']) => {
  const label = data.map((item) => item.label).join('.');
  const value = data.map((item) => item.value).join('.');
  formula.insertField(label, value, data, TYPES.custom_page);
};
export const insertEditField = (formula: Formula, data: IEditExpression['config']) => {
  const label = data[data.length - 1].label;
  const value = data[data.length - 1].value;
  formula.insertField(label, value, data, TYPES.edit_selector);
  // formula.insertField(label, value, data, TYPES.custom_page);
};

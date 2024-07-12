// import { TYPES } from '../config';
import { tokenize } from 'excel-formula-tokenizer';
import { aggregateFunctions, CALC_VALUE_BY_CODE, CALC_AGGREGATE_VALUE } from '../config';
import { tokenExp } from './tokens';
export interface IDependenceItem {
  fieldCode: string;
  modelCode: string;
  unionCode: string;
  aggregate: boolean;
  area: number;
}
export interface IDependence {
  expression: string;
  dependencies: Array<IDependenceItem>;
}

export const analyzeFormula = (
  // data: any,
  formula: string
  // modelCode: string,
  // option: { current: Record<string, any> }
) => {
  const tokens = tokenize(formula);
  const inFunctions: string[] = [];
  return tokens.reduce<IDependence>(
    (memo, t) => {
      if (t.type === 'function' && t.subtype === 'start') {
        inFunctions.push(t.value);
        memo.expression += `${t.value}(`;
      } else if (t.type === 'function' && t.subtype === 'stop') {
        inFunctions.pop();
        memo.expression += ')';
      } else if (t.type === 'operand' && t.subtype === 'range') {
        const functionName = inFunctions[inFunctions.length - 1];
        const inAggregate = aggregateFunctions.includes(functionName);
        if (tokenExp.field.test(t.value)) {
          const unionCode = t.value.replace(/[[\]]/g, '');
          const fields = unionCode.split('.');
          const fieldCode = fields.pop()!;
          const modelCode = fields.pop()!;
          const uniCodes = (unionCode || '').split('.');
          let area = 1;
          if (uniCodes.length === 2 || uniCodes.length === 3) {
            area = 1;
          } else if (uniCodes.length === 4) {
            area = 2;
          } else if (uniCodes.length === 5) {
            area = 3;
          }
          if (inAggregate) {
            memo.dependencies.push({
              fieldCode,
              modelCode,
              unionCode,
              aggregate: true,
              area,
            });
            memo.expression += `${CALC_AGGREGATE_VALUE}('${fieldCode}','${modelCode}','${unionCode}')`;
          } else {
            memo.dependencies.push({
              fieldCode,
              modelCode,
              unionCode,
              aggregate: false,
              area,
            });
            memo.expression += `${CALC_VALUE_BY_CODE}('${fieldCode}','${modelCode}','${unionCode}')`;
          }
        } else {
          memo.expression += t.value;
        }
      } else if (t.type === 'subexpression' && t.subtype === 'start') {
        memo.expression += `(`;
      } else if (t.type === 'subexpression' && t.subtype === 'stop') {
        memo.expression += ')';
      } else {
        memo.expression += t.value;
      }
      return memo;
    },
    {
      dependencies: [],
      expression: '',
    }
  );
};

export const analyzeDependence = (formula: string) => {
  const tokens = tokenize(formula);
  const inFunctions: string[] = [];
  return tokens.reduce<Array<Record<string, any>>>((memo, t) => {
    if (t.type === 'function' && t.subtype === 'start') {
      inFunctions.push(t.value);
    } else if (t.type === 'function' && t.subtype === 'stop') {
      inFunctions.pop();
    } else if (t.type === 'operand' && t.subtype === 'range') {
      const functionName = inFunctions[inFunctions.length - 1];
      const inAggregate = aggregateFunctions.includes(functionName);
      if (tokenExp.field.test(t.value)) {
        const unionCode = t.value.replace(/[[\]]/g, '');
        const fields = unionCode.split('.');
        const fieldCode = fields.pop()!;
        const modelCode = fields.pop()!;
        if (inAggregate) {
          memo.push({
            fieldCode,
            modelCode,
            unionCode,
            aggregate: true,
          });
        } else {
          memo.push({
            fieldCode,
            modelCode,
            unionCode,
            aggregate: false,
          });
        }
      }
    }
    return memo;
  }, []);
};

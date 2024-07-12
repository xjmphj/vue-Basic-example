import { TYPES } from '../config';
import { IValueTokenItem } from './Formula';
import type { FunctionMapType } from '../hooks/use-functions';
export const tokenExp = {
  field: /^\[([^[\]]+)\]/,
  operate: /^([+\-*/])/,
  bracket: /^([()])/,
  space: /^(\s+)/,
  function: /^@([^@()\s]+)/,
  digital: /^([1-9][0-9]*|[0-9])(\.[0-9]*[1-9]|)(e[1-9][0-9]*|)/,
  comma: /^,/,
};
export interface IToken {
  input: string;
  field: string;
  type: TYPES;
}

const tokenFactory = (input: string, field: string, type: TYPES): IToken => ({
  input,
  field,
  type,
});
export const parseTokens = (value: string) => {
  let t: RegExpMatchArray | null;
  const tokens: Array<IToken> = [];
  while (value.length > 0) {
    switch (true) {
      case !!(t = value.match(tokenExp.field)): {
        const [stepStr, field] = t!;
        tokens.push(tokenFactory(stepStr, field, TYPES.field));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.operate)): {
        const [stepStr, field] = t!;
        tokens.push(tokenFactory(stepStr, field, TYPES.operation));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.bracket)): {
        const [stepStr, field] = t!;
        tokens.push(tokenFactory(stepStr, field, TYPES.bracket));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.space)): {
        const [stepStr, field] = t!;
        tokens.push(tokenFactory(stepStr, field, TYPES.space));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.function)): {
        const [stepStr, field] = t!;
        tokens.push(tokenFactory(stepStr, `@${field}`, TYPES.function));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.digital)): {
        const [stepStr] = t!;
        tokens.push(tokenFactory(stepStr, stepStr, TYPES.digital));
        value = value.substring(stepStr.length);
        break;
      }
      case !!(t = value.match(tokenExp.comma)): {
        const [stepStr] = t!;
        tokens.push(tokenFactory(stepStr, stepStr, TYPES.comma));
        value = value.substring(stepStr.length);
        break;
      }
      default:
        tokens.push(tokenFactory(value[0], value[0], TYPES.unknown));
        value = value.substring(1);
    }
  }
  return tokens;
};

export const getTokens = (
  value: string,
  fieldMap: Record<string, any>,
  functionValueMap: FunctionMapType,
  props: any
) => {
  return parseTokens(value).map<IValueTokenItem>((token) => {
    const { type, field: value } = token;
    if (type === TYPES.field) {
      const target = fieldMap[value];
      return {
        type,
        value: value,
        // parentLabel: target.parentLabel,
        label: target[props.label],
        // options: {
        //   tips: target.parentLabel,
        // },
      };
    } else if (type === TYPES.function) {
      return {
        type,
        value: `${value}`,
        label: functionValueMap[value]?.label,
      };
    } else {
      return { type, value, label: value };
    }
  });
};

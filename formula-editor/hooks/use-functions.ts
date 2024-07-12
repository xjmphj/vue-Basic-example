import { to } from '@/utils';
import { getFunctionLibrary } from '@/api/convert-rules/index';
import { computed, shallowRef, watchEffect, type ShallowRef } from 'vue';
import { TYPES } from '../config';
import { functionCategory } from '@/api/convert-rules/type';
const functionStore = new Map<functionCategory, IFuncRetDataItem[]>();
export function random(num = 100) {
  return Math.random() * num + 1;
}
export const resultFactory = (error: string | null, ret: any) => {
  return { error, ret };
};
type ParamsType = 'number' | 'string' | 'boolean' | 'object' | 'varchar';
export interface IParamType {
  isFixedSize?: boolean;
  parameterType: ParamsType;
}

export interface IFunctionItem {
  type: TYPES;
  label: string;
  value: string;
  desc: string;
  func: (...args: any[]) => { error: string | null; ret: any };
  inputParams: Array<IParamType>;
  returnParams: IParamType;
  paramsCount: number;
}
export interface IItem {
  nameShow: string;
  nameActual: string;
  describe: string;
  sort: number;
  parameterConfig: {
    inputParameters: Array<IParamType>;
    returnParameter: Omit<IParamType, 'isFixedSize'>;
  };
}
export interface IFuncDataItem<T> {
  categoryName: string;
  categoryCode: string;
  functions: Array<T>;
}
export type FunctionMapType = Record<string, IFunctionItem>;
// export type FuncListItem = IFuncDataItem<IFunctionItem>;
export type IFuncRetDataItem = IFuncDataItem<IItem>;

export interface FuncListItem {
  label: string;
  value: string;
  functions: Array<IFunctionItem>;
}

export const getFunctionList = (category: functionCategory) => {
  const functionList = shallowRef<IFuncRetDataItem[]>([]);
  const getList = async () => {
    if (functionStore.get(category)) {
      functionList.value = functionStore.get(category)!;
      return;
    }
    const [data] = await to(getFunctionLibrary(category));
    if (data && data.success) {
      functionList.value = data.data;
      functionStore.set(category, data.data);
    }
  };
  getList();
  return { functionList };
};

export const handleFunctionList = (list: ShallowRef<IFuncRetDataItem[]>) => {
  const functionCategoryList = shallowRef<Array<FuncListItem>>([]);
  // 生成校验函数
  const functionFactory = (fn: IItem) => {
    const input = fn.parameterConfig.inputParameters;
    const output = fn.parameterConfig.returnParameter;
    return function (...args: any[]) {
      // 校验每个参数的类型
      // const validInput = () => {
      //   for (let i = 0; i < input.length; i++) {
      //     if (typeof args[i] !== input[i].parameterType) {
      //       return resultFactory(
      //         `${fn.nameShow}函数第${i + 1}个参数需要是${typeMap[input[i].parameterType]}类型`,
      //         null
      //       );
      //     }
      //   }
      //   return false;
      // };
      // 生成最终的返回值

      const generateResult = () => {
        switch (output.parameterType) {
          case 'number':
          case 'object':
          case 'varchar':
          case 'string':
            return random();

          case 'boolean':
            return true;
          default:
            return '';
        }
      };
      const inputLength = input.length;
      // 校验参数个数
      const notFixedSize = input.some((item) => item.isFixedSize === false);
      if (!notFixedSize) {
        if (args.length !== inputLength) {
          return resultFactory(`${fn.nameShow}函数只允许有${inputLength}个参数`, null);
        }
      }
      // 不确定用户选择的字段具体对应的是什么数据类型，先不校验数据类型
      // const validStatus = validInput();
      // if (validStatus !== false) {
      //   return validStatus;
      // }

      return { error: null, ret: generateResult() };
    };
  };

  const getParamsCount = (params: IParamType[]): number => {
    const length = params.length;
    if (length === 1 && !params[0].isFixedSize) {
      // 参数无限制
      return -1;
    }
    return length;
  };
  watchEffect(() => {
    const r: Array<FuncListItem> = []; // 结果集
    list.value.forEach((item) => {
      const ret: FuncListItem = {
        label: item.categoryName,
        value: item.categoryCode,
        functions: [],
      };

      item.functions.forEach((subItem) => {
        const subRet = {
          type: TYPES.function,
          label: subItem.nameShow,
          value: subItem.nameActual,
          desc: subItem.describe,
          func: functionFactory(subItem),
          inputParams: subItem.parameterConfig.inputParameters,
          returnParams: subItem.parameterConfig.returnParameter,
          paramsCount: getParamsCount(subItem.parameterConfig.inputParameters),
        };
        ret.functions.push(subRet);
      });
      r.push(ret);
    });
    functionCategoryList.value = r;
  });

  const functionList = computed(() => {
    return functionCategoryList.value.reduce<Array<IFunctionItem>>((memo, cur) => {
      memo = [...memo, ...cur.functions];
      return memo;
    }, []);
  });

  const functionValueMap = computed(() => {
    return functionList.value.reduce<FunctionMapType>((memo, cur) => {
      memo[cur.value] = cur;
      return memo;
    }, {});
  });

  const functionLabelMap = computed(() => {
    return functionList.value.reduce<FunctionMapType>((memo, cur) => {
      memo[cur.label] = cur;
      return memo;
    }, {});
  });
  const functionLabelList = computed(() => {
    return functionList.value.map((item) => item.label);
  });

  return {
    functionCategoryList,
    functionList,
    functionValueMap,
    functionLabelList,
    functionLabelMap,
  };
};

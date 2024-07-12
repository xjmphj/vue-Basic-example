import { ConditionItemChild } from '@/components/expression-common';
// import { IExpression } from '@dev/views/custom-page/design/types/type';

export interface IInterfaceConfig {
  type: string;
  path: string;
}

export const initData = (): ConditionItemChild<IInterfaceConfig, string> => {
  return {
    leftExpr: {
      type: 'string',
      path: '',
    },
    operator: null,
    rightExpr: '{elements: []}',
  };
};

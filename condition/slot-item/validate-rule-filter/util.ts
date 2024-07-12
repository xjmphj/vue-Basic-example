import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common';
import { IExpression } from '@dev/views/custom-page/design/types/type';

export const initData = (): ConditionItemChild<IExpression, IExpression> => {
  return {
    leftExpr: [],
    operator: OperatorTypeEnum.eq,
    rightExpr: [],
  };
};

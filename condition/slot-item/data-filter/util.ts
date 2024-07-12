import { ICascadeItem } from '@/api/convert-rules/type';
import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common';
import { valueType } from '@/views/convert-rules/components/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';

export const initData = (): ConditionItemChild<ICascadeItem, IExpression> => {
  return {
    leftExpr: {
      type: valueType.field,
      modelCode: '',
      fieldCode: '',
      fieldName: '',
      fieldType: '',
      unionCode: '',
    },
    operator: OperatorTypeEnum.eq,
    rightExpr: [],
  };
};

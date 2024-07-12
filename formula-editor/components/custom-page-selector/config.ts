import { FieldTypeEnum } from '@develop/views/custom-page/design/types/type';
import { WidgetEnum } from '@dev/views/custom-page/design/config';

export const fieldCanSelect = [
  FieldTypeEnum.iteration,
  FieldTypeEnum.virtual,
  FieldTypeEnum.tableField,
];
export const EMPTY_NODE = 'EMPTY_NODE';

// 循环组件行下拉选项label后缀，如：全部卡片、全部行
export const rowLabelSuffix = {
  [WidgetEnum.cardList]: '卡片',
  [WidgetEnum.dataTable]: '行',
  [WidgetEnum.editTable]: '行',
};

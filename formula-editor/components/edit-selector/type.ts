import { IPageVariable } from '@develop/views/custom-page/design/types/widget-config';
import { FieldTypeEnum } from '@develop/views/custom-page/design/types/type';

export interface IEditSelectorField {
  [FieldTypeEnum.variable]: IPageVariable[];
}

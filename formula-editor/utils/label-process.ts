import { TYPES } from '../config';
import { getLogicLabel } from '../hooks/use-cm';
import { IValueTokenItem } from './Formula';

export const customPageFieldLabel = (data: IValueTokenItem) => {
  return data.config.map((item: any) => item.label).join('.');
};
export const editSelectorFieldLabel = (data: IValueTokenItem) => {
  return data.config.map((item: any) => item.label).join('.');
};

export const logicLabelFieldLabel = (data: IValueTokenItem) => {
  return getLogicLabel(data.config, true);
};

export const filedLabelProcessMap = {
  [TYPES.custom_page]: customPageFieldLabel,
  [TYPES.logic_field]: logicLabelFieldLabel,
  [TYPES.edit_selector]: editSelectorFieldLabel,
};

import { markRaw } from 'vue';
import CustomPageSelector from './custom-page-selector/index.vue';
import LogicSelector from './logic-selector/index.vue';
import EditSelector from './edit-selector/index.vue';
import Custom from './custom/index.vue';
import { FiledTypeEnum } from '../types';

export const widgetMap = {
  [FiledTypeEnum.logic]: markRaw(LogicSelector),
  [FiledTypeEnum.page]: markRaw(CustomPageSelector),
  [FiledTypeEnum.edit_selector]: markRaw(EditSelector),
  [FiledTypeEnum.custom]: markRaw(Custom),
};

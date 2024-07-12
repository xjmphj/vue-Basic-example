// @ts-nocheck

import { App } from 'vue';
// import { CaretBottom } from '@element-plus/icons-vue';
export const elementDefaultPropsEdit = (app: App) => {
  const context = app._context;
  // 输入框

  context.components.ElInput.props.size = { default: '28', type: String };
  // el-drawer
  context.components.ElDrawer.props.destroyOnClose.default = true;
  context.components.ElDrawer.props.appendToBody.default = true;
  context.components.ElDrawer.props.closeOnClickModal.default = false;
  context.components.ElDrawer.props.size.default = 480;
  //el-table
  // context.components.ElTable.TableColumn.props.minWidth.default = 160;
  context.components.ElTable.TableColumn.props.showOverflowTooltip = {
    default: true,
    type: Boolean,
  };
  context.components.ElTable.props.size = { default: 'small', type: String };
  context.components.ElTable.props.scrollbarAlwaysOn = true;
  context.components.ElTable.props.tooltipEffect = { default: 'light', type: String };
  context.components.ElTable.props.border = { default: false, type: Boolean };
  context.components.ElTable.props.highlightCurrentRow = { default: true, type: Boolean };
  context.components.ElTable.props.stripe = { default: true, type: Boolean };
  // 选择器
  context.components.ElSelect.props.size = {
    type: String,
    default: 'small',
  };
  // context.components.ElSelect.props.collapseTags = {
  //   type: Boolean,
  //   default: true,
  // };
  // context.components.ElTreeSelect.props.collapseTags = {
  //   type: Boolean,
  //   default: true,
  // };
  // 级联
  // context.components.ElCascader.props.collapseTags = {
  //   type: Boolean,
  //   default: true,
  // };
  // context.components.ElSelect.props.size.default = '28';
  // context.components.ElTreeSelect.props.suffixIcon.default = CaretBottom;
  // 分页
  context.components.ElPagination.props.small = {
    type: Boolean,
    default: true,
  };
  context.components.ElPagination.props.background = {
    type: Boolean,
    default: true,
  };
  context.components.ElCascader.props.props.default = () => ({
    expandTrigger: 'hover' as const,
  });
};

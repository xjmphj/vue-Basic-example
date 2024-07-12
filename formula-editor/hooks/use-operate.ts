import { ref } from 'vue';

import type { ElTree } from 'element-plus';
import { TreeNodeData } from 'element-plus/es/components/tree/src/tree.type';
// import { FuncListItem } from './use-functions';

// export const useEdit = (formInstance: Ref<FormInstance | undefined>) => {
//   const editFieldCode = ref<string>('');
//   const inputRefMap: Record<string, InputInstance> = {};
//   const onInputRef = (ref: any, data: IFieldSettingItem) => {
//     if (ref) {
//       inputRefMap[data.fieldCode] = ref;
//     }
//   };
//   const editHandler = (data: IFieldSettingItem) => {
//     editFieldCode.value = data.fieldCode;
//     nextTick(() => {
//       inputRefMap[data.fieldCode].focus();
//     });
//   };

//   const editEnsure = async () => {
//     const status = await formInstance.value?.validate();
//     if (status) {
//       editFieldCode.value = '';
//     }
//   };
//   return { editFieldCode, editEnsure, editHandler, onInputRef };
// };

// export const fieldSearch = (fields: Ref<Field[]>) => {
//   const search = ref<string>('');
//   const filteredFields = ref<Field[]>(fields.value);
//   const onSearch = () => {
//     filteredFields.value = fields.value.filter((item) => item.fieldName.includes(search.value));
//   };
//   return { search, filteredFields, onSearch };
// };

export const useSearch = (props?: any) => {
  const treeRef = ref<InstanceType<typeof ElTree>>();
  const searchKey = ref<string>('');
  const treeProps = {
    class: (data: any) => {
      return data.disabled ? 'formula_disabled_0320' : '';
    },
    ...(props || {
      children: 'functions',
      label: 'label',
    }),
  };
  const filterMethod = (val: string, data: TreeNodeData) => {
    if (!val) return true;
    return data[treeProps.label].includes(val);
  };
  const onSearch = () => {
    treeRef.value?.filter(searchKey.value);
  };

  return { treeRef, onSearch, searchKey, filterMethod, treeProps };
};

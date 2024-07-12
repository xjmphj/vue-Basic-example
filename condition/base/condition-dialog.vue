<template>
  <el-dialog
    v-if="dialogVisible"
    v-model="dialogVisible"
    class="contain-scrollbar"
    :title="title"
    :width="686"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :before-close="onBeforeClose"
  >
    <template #header>
      <input-editor v-if="titleEdit" v-model="dialogTitle" />
      <span class="title" v-else>{{ dialogTitle }}</span>
    </template>
    <el-scrollbar height="496px">
      <condition-content
        v-model="conditionValue"
        :initData="initData"
        :disabled="disabled"
        ref="conditionContentRef"
      >
        <template #default="scope"> <slot v-bind="scope" /> </template>
      </condition-content>
    </el-scrollbar>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button @click="beforeEnsure" type="primary">确定</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, toRefs } from 'vue';
import { ICondition } from '../../expression-common/index';
import _cloneDeep from 'lodash/cloneDeep';
import ConditionContent from './condition-content.vue';
const props = withDefaults(
  defineProps<{
    visible: boolean;
    title?: string;
    titleEdit?: boolean;
    condition?: ICondition | null;
    initData?: Function;
    disabled?: boolean;
  }>(),
  {
    title: '条件设置',
    titleEdit: false,
  }
);
const emits = defineEmits<{
  (e: 'update:visible', val: boolean): void;
  (e: 'ensure', val: ICondition | null): void;
  (e: 'ensure:title', val: { title: string; condition: ICondition | null }): void;
}>();
const conditionContentRef = ref<InstanceType<typeof ConditionContent>>();
const { titleEdit, title, initData, disabled } = toRefs(props);
const initCondition = () => {
  if (!props.condition) return null;
  return _cloneDeep(props.condition);
};
const dialogTitle = ref<string>(title.value);
const conditionValue = ref<ICondition | null>(initCondition());
const dialogVisible = computed({
  get() {
    return props.visible;
  },
  set(val: boolean) {
    emits('update:visible', val);
  },
});
const onBeforeClose = (fn: Function) => {
  fn();
  return true;
};
const beforeEnsure = () => {
  if (disabled?.value) {
    dialogVisible.value = false;
  } else {
    ensure();
  }
};
const ensure = async () => {
  const flag = await conditionContentRef.value?.formInstance?.validate();
  if (!flag) return false;
  if (titleEdit.value) {
    emits('ensure:title', {
      title: dialogTitle.value,
      condition: conditionValue.value,
    });
  } else {
    emits('ensure', conditionValue.value);
  }
  onBeforeClose(() => {
    dialogVisible.value = false;
  });
};
const cancel = () => {
  onBeforeClose(() => {
    dialogVisible.value = false;
  });
};

defineOptions({
  name: 'condition-dialog',
});
</script>

<style scoped lang="scss">
.title {
  font-size: 14px;
  font-weight: bold;
  color: var(--font-color-title);
}
</style>

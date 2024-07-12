<template>
  <div class="title-editor">
    <div
      v-show="editing"
      class="input"
      contenteditable="true"
      @blur="onBlur"
      @keydown.enter.prevent="onEnter"
      @input="onInput"
      ref="editRef"
    >
      {{ editValue }}
    </div>
    <div class="input ellipsis" v-show="!editing">{{ value }}</div>
    <svg-icon class="icon" name="edit-pen" :color="iconColor" @click="edit" :size="20" />
  </div>
</template>

<script setup lang="ts">
import { useFormItem } from 'element-plus';
import { debugWarn } from 'element-plus/es/utils/error';
import { ref, computed, nextTick } from 'vue';
const { formItem } = useFormItem();
const props = defineProps<{
  modelValue: string;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'change', val: string): void;
}>();
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: string) {
    emits('update:modelValue', val);
  },
});
// const value = ref('');
const editing = ref<boolean>(false);
const editValue = ref<string>('');
const editRef = ref<HTMLDivElement>();
const onBlur = () => {
  onEnter();
};
const iconColor = computed(() => {
  if (editing.value) {
    return 'transparent';
  } else {
    return '#165DFF';
  }
});
const edit = () => {
  editValue.value = value.value;
  editing.value = true;
  setSelection();
};
const setSelection = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!editRef.value) return;
      const selection = window.getSelection();
      const range = document.createRange();
      const content = editRef.value.firstChild;
      // 如果存在内容，则设置选区
      if (content) {
        range.selectNode(content);
        range.setStart(content, 0);
        range.setEnd(content, content.textContent?.length ?? 0);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        // 不存在内容，则设置光标位置
        range.setStart(editRef.value, 0);
        range.setEnd(editRef.value, 0);
        selection?.removeAllRanges();
        selection?.addRange(range);
      }
      resolve(true);
    });
  });
};
const onEnter = () => {
  value.value = editRef.value?.textContent ?? '';
  emits('change', editRef.value?.textContent as string);
  formItem?.validate?.('change').catch((err) => debugWarn(err));
  nextTick(() => {
    editing.value = false;
  });
};
const onInput = () => {};
defineOptions({
  name: 'title-editor',
});
</script>

<style scoped lang="scss">
.title-editor {
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .input {
    color: var(--text-8);
    min-width: 30px;
    max-width: calc(100% - 24px);
    height: 24px;
    font-size: 14px;
    line-height: 24px;
    border-bottom: 2px dashed #e5e6eb;
    outline: none;
    overflow: hidden;
    white-space: nowrap;
    &::selection {
      background-color: #bedaff;
    }
    &.ellipsis {
      text-overflow: ellipsis;
    }
  }

  .icon {
    flex-shrink: 0;
    width: 20px;
    cursor: pointer;
  }
}
</style>

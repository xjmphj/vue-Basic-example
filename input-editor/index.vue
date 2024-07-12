<template>
  <div class="input-editor">
    <div class="input-wrapper" v-show="editing">
      <el-input
        v-model="value"
        @input="onChange"
        @blur="onBlur"
        @focus="emits('focus')"
        @keyup.enter="onEnter"
        ref="inputRef"
      />
    </div>
    <div class="text ellipsis" v-show="!editing">{{ value }}</div>
    <svg-icon
      v-show="!editing"
      class="icon"
      name="edit-pen"
      color="#165DFF"
      hover-color="#4080FF"
      @click="edit"
      :size="16"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useFormItem } from 'element-plus';
import { debugWarn } from 'element-plus/es/utils/error';
import { ElInput } from 'element-plus';
const { formItem } = useFormItem();
const props = defineProps<{
  modelValue: string;
}>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: string): void;
  (e: 'change', val: string): void;
  (e: 'focus'): void;
  (e: 'blur'): void;
  (e: 'enter'): void;
}>();
const inputRef = ref<InstanceType<typeof ElInput>>();
const editing = ref<boolean>(false);
const value = computed({
  get() {
    return props.modelValue;
  },
  set(val: string) {
    emits('update:modelValue', val);
  },
});
const onChange = (val: string) => {
  formItem?.validate?.('change').catch((err) => debugWarn(err));
  emits('change', val);
};
const save = () => {
  editing.value = false;
  formItem?.validate?.('blur').catch((err) => debugWarn(err));
};
const onBlur = () => {
  save();
  emits('blur');
};
const onEnter = () => {
  save();
  emits('enter');
};
const edit = () => {
  editing.value = true;
  inputRef.value?.focus();
};
defineOptions({
  name: 'input-editor',
});
</script>

<style scoped lang="scss">
.input-editor {
  color: inherit;
  font-size: inherit;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  .input-wrapper {
    width: 216px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
  }
  .text {
    line-height: 28px;
    overflow: hidden;
    white-space: nowrap;
    &.ellipsis {
      text-overflow: ellipsis;
    }
  }
  .icon {
    margin-left: 4px;
    flex-shrink: 0;
    width: 16px;
    cursor: pointer;
  }
}
</style>

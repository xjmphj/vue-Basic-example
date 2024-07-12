<template>
  <el-dropdown trigger="click" @visible-change="onVisibleChange" :disabled="disabled">
    <div class="reference" :class="{ disabled: disabled }">
      <span class="label">{{ label }}</span>
      <svg-icon
        class="icon"
        :color="disabled ? '#c4cbd8' : '#1d2129'"
        :class="{ rotate: iconRotate }"
        name="sj-right-sx"
        :size="16"
      />
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="item in combinatorList"
          :key="item.value"
          :style="{ color: item.value === modelValue ? 'var(--el-color-primary)' : '' }"
          @click="onClick(item)"
          >{{ item.label }}</el-dropdown-item
        >
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed, ref, inject, toRefs } from 'vue';
import { combinatorList, combinatorType } from '../../expression-common/index';
import { formContextKey } from 'element-plus';

const props = defineProps<{ modelValue: combinatorType; disabled?: boolean }>();
const emits = defineEmits<{
  (e: 'update:modelValue', val: combinatorType): void;
}>();
const { modelValue } = toRefs(props);
const form = inject(formContextKey, undefined);

const iconRotate = ref<boolean>(false);
const label = computed(() => {
  return combinatorList.find((item) => item.value === modelValue.value)?.label;
});
const onVisibleChange = (val: boolean) => {
  iconRotate.value = val;
};
const disabled = computed(() => props.disabled || form?.disabled || false);
const onClick = (data: typeof combinatorList[0]) => {
  if (modelValue.value !== data.value) {
    emits('update:modelValue', data.value);
  }
};
defineOptions({
  name: 'logic-symbol-select',
});
</script>

<style scoped lang="scss">
.reference {
  height: 28px;
  background: #f2f3f5;
  border-radius: 2px;
  padding: 0 12px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  color: #1d2129;
  line-height: 14px;
  font-size: 12px;
  cursor: pointer;
  &.disabled {
    color: #c4cbd8;
    cursor: not-allowed;
  }
  .label {
    margin-right: 4px;
  }
  .icon {
    transition: all 0.3s;
    transform: rotate(90deg);
    &.rotate {
      transform: rotate(270deg);
    }
  }
}
</style>

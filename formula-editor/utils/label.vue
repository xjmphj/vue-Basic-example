<template>
  <span class="label">
    <!-- <el-tooltip class="item" effect="dark" :content="computedTips" placement="top"> -->
    <el-tag size="small">{{ label }}</el-tag>
    <!-- </el-tooltip> -->
  </span>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
import { ElTag } from 'element-plus';

const props = defineProps<{ label: string }>();
const { label } = toRefs(props);
// const computedTips = computed(() => {
//   return `来自 ${tips.value}`;
// });
</script>

<style scoped lang="scss">
.label {
  padding: 0 2px;
}
</style>

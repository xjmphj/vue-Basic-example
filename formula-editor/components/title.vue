<template>
  <div class="option_title">{{ desc }}</div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue';
const props = defineProps<{ desc: string }>();
const { desc } = toRefs(props);
</script>

<style scoped lang="scss">
.option_title {
  color: var(--font-color-title);
  margin-bottom: 8px;
}
</style>

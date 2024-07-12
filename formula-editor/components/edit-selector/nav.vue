<template>
  <div v-if="navList.length === 1" class="nav-one">
    {{ navList[0].label }}
  </div>
</template>
<script setup lang="ts">
defineProps<{
  navList: Array<{ label: any; value: any }>;
}>();
</script>
<style scoped>
.nav-one {
  box-sizing: border-box;
  height: 36px;
  background-color: var(--fill-color-lighten);
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-size: 12px;
  color: #627189;
  border-bottom: 1px solid var(--border-color-lighten);
  padding: 0 13px;
}
</style>

<template>
  <div class="three-template">
    <div class="left content">
      <slot name="first" />
    </div>
    <div class="operation">
      <slot name="second" />
    </div>
    <div class="right content">
      <slot name="third" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: 'three-template' });
</script>

<style scoped lang="scss">
.three-template {
  display: flex;
  align-items: center;
  justify-content: space-between;
  .content {
    flex: 1 0 0;
  }
  .operation {
    width: 110px;
    box-sizing: border-box;
    padding: 0 8px;
    :deep() {
      .el-select {
        min-width: auto;
      }
    }
  }
  .left {
    :deep() {
      .el-select {
        width: 100%;
      }
    }
  }
  :deep() {
    .el-form-item--default {
      margin-bottom: 14px;
    }
  }
}
</style>

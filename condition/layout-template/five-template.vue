<template>
  <el-row :gutter="2" justify="space-between" align="middle" class="five-template">
    <el-col :span="4" class="content">
      <slot name="first" />
    </el-col>
    <el-col :span="5" class="content">
      <slot name="second" />
    </el-col>
    <el-col :span="4" class="content">
      <slot name="third" />
    </el-col>
    <el-col :span="4" class="content">
      <slot name="four" />
    </el-col>
    <el-col :span="6" class="content">
      <slot name="five" />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
defineOptions({ name: 'five-template' });
</script>

<style scoped lang="scss">
.five-template {
  width: 100%;
  .content {
    &:last-child {
      margin-right: 0;
    }
  }
}
</style>

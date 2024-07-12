<template>
  <component
    :is="widgetMap[type]"
    :field-params="(fieldParams as any)"
    :formula="formula"
    v-bind="$attrs"
  />
</template>

<script setup lang="ts">
import { FieldParams } from '../types';
import { widgetMap } from './config';
import Formula from '../utils/Formula';
import { computed, toRefs } from 'vue';
const props = defineProps<{
  fieldParams: FieldParams;
  formula: Formula | null;
}>();
const { fieldParams, formula } = toRefs(props);
const type = computed(() => {
  return fieldParams.value.type;
});
defineOptions({
  name: 'field-widget',
});
</script>

<style scoped lang="scss"></style>

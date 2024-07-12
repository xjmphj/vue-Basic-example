<template>
  <div class="data-filter">
    <div class="left content">
      <staff-department-selector
        :type="type"
        v-model="data.leftExpr"
        :prop="genProp('leftExpr.unionCode')"
      />
    </div>
    <div class="operation">
      <operation-selector
        v-model="data.operator"
        :prop="genProp('operator')"
        @change="onOperationChange"
      />
    </div>
    <div class="right content">
      <formula-edit
        v-if="!hideRight"
        v-model="data.rightExpr"
        :category="6"
        :fieldParams="customParams"
        :prop="genProp('rightExpr')"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRefs } from 'vue';
import OperationSelector from '../../common/operation-selector.vue';
import { ConditionItemChild, OperatorTypeEnum } from '@/components/expression-common';
import { ICascadeItem } from '@/api/convert-rules/type';
import { IExpression } from '@dev/views/custom-page/design/types/type';
import FormulaEdit from '../../common/formula.vue';
import { IPageFields } from '@/components/formula-editor/types';
import StaffDepartmentSelector from '../../common/staff-department-selector.vue';
import { DepartmentTypeEnum } from '@/api/custom-page/type';

const props = defineProps<{
  parentData: Array<ConditionItemChild<ICascadeItem, IExpression>>;
  parentIndex: number;
  data: ConditionItemChild<ICascadeItem, IExpression>;
  index: number;
  customParams: IPageFields;
  type: DepartmentTypeEnum;
  genProp: (val: string) => string;
}>();
const { data, customParams, type, genProp } = toRefs(props);
const onOperationChange = (val: OperatorTypeEnum | null) => {
  if (val && [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(val)) {
    data.value.rightExpr = [];
  }
};
const hideRight = computed(() => {
  return (
    data.value.operator &&
    [OperatorTypeEnum.isNull, OperatorTypeEnum.notNull].includes(data.value.operator)
  );
});
defineOptions({
  name: 'staff-filter-slot',
});
</script>

<style scoped lang="scss">
.data-filter {
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
}
</style>

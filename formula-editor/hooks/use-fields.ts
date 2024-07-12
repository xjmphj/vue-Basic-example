export const getFieldList = (fields: any[], treeProps: any) => {
  const ret: any[] = [];
  const travel = (fields: any) => {
    fields.forEach((field: any) => {
      ret.push(field);
      const children = field[treeProps.children];
      if (Array.isArray(children)) {
        travel(children);
      }
    });
  };
  travel(fields);
  return ret;
};

export const getFieldMap = (fieldList: any[], nodeKey: string) => {
  return fieldList.reduce((memo, cur) => {
    memo[cur[nodeKey]] = cur;
    return memo;
  }, {});
};

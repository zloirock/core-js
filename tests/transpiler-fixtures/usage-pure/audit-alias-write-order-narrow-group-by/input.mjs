// an assignment-form ctor alias narrows statics once the registered write dominates the read
let M;
({ Map: M } = globalThis);
export const a = M.groupBy(items, keyFn);

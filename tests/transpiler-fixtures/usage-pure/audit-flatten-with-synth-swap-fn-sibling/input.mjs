// A sibling function default keeps its own caller-correct mirror beside the nested static.
const { Array: { from } } = globalThis, helper = function ({ of } = Array) {
  return of(1, 2);
};
export { from, helper };

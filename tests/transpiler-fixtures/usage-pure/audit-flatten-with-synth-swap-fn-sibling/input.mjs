// proxy flatten + sibling that's a function with param synth-swap. param synth-swap emits
// transforms inside the sibling function-expression body. asserts these inner transforms
// do not collide with the multi-decl full-declaration overwrite
const { Array: { from } } = globalThis, helper = function ({ of } = Array) {
  return of(1, 2);
};
export { from, helper };

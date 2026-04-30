// for-init with destructure pattern (not nested-proxy). asserts the for-init branch in
// applyDestructuringTransforms emits comma-separated declarators for the loop header
let result = 0;
for (let { from } = Array, i = 0; i < 1; i++) {
  result = from([1, 2]).length;
}
export { result };

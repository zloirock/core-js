import _Array$from from "@core-js/pure/actual/array/from";
// for-init with destructure pattern (not nested-proxy). asserts the for-init branch in
// destructuring transform pass emits comma-separated declarators for the loop header
let result = 0;
for (let from = _Array$from, i = 0; i < 1; i++) {
  result = from([1, 2]).length;
}
export { result };
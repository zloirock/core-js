import _Array$from from "@core-js/pure/actual/array/from";
// for-statement init with multi-decl: nested-proxy-flattenable destructure plus a
// counter declarator. asserts isForInit branch in renderFlattened produces single
// kind statement with comma-separated parts (multi-statement output would be invalid
// for-init)
let result = 0;
for (let from = _Array$from, i = 0; i < 1; i++) {
  result = from([1, 2]).length;
}
export { result };
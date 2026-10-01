import _Array$from from "@core-js/pure/actual/array/from";
// when babel's destructuring transform runs after this plugin, the `{from}` parameter
// pattern is rewritten into an Identifier with body-level `var from = _ref.from`. the
// IIFE arg `Array` must still be substituted with the polyfilled receiver - otherwise
// the legacy runtime sees a bare native `Array` and the destructure throws
const r = function (_ref) {
  let from = _ref.from;
  return from([1, 2, 3]);
}({
  from: _Array$from
});
export { r };
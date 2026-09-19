import _Array$from from "@core-js/pure/actual/array/from";
// multi-declarator: flattened `globalThis` proxy destructure plus a sibling IIFE whose
// function body declares `var globalThis = 'shadow'`. the `var` hoists to the IIFE
// scope, so the inner reference must resolve to the local var rather than the polyfill
// binding
const from = _Array$from;
const y = function () {
  var globalThis = 'shadow';
  return globalThis;
}();
export { from, y };
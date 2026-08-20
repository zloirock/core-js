// multi-declarator: flattened `globalThis` proxy destructure plus a sibling IIFE whose
// function body declares `var globalThis = 'shadow'`. the `var` hoists to the IIFE
// scope, so the inner reference must resolve to the local var rather than the polyfill
// binding
const { Array: { from } } = globalThis, y = (function () {
  var globalThis = 'shadow';
  return globalThis;
})();
export { from, y };

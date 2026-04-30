import _Array$from from "@core-js/pure/actual/array/from";
const from = _Array$from;
// multi-declarator: flattened `globalThis` proxy destructure plus a sibling IIFE whose
// block body declares `let globalThis = 'shadow'`. the block-scoped `let` shadows the
// global, so the inner reference must keep pointing at the local binding rather than
// being rewritten to the polyfill
const y = (() => {
  let globalThis = 'shadow';
  return globalThis;
})();
export { from, y };
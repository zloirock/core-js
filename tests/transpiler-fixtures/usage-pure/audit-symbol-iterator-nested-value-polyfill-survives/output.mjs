import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// `[Symbol.iterator]` computed key paired with a NESTED ObjectPattern value (not a simple
// binding identifier) collapses to the get-iterator-method helper: the iterator method is
// read once through the helper and the nested pattern destructures its `.call`. the symbol
// polyfill must survive the nested-value shape - a raw static-symbol key read must not be
// silently dropped from the emit.
const obj = {};
const {
  call: fn
} = _getIteratorMethod(obj);
fn;
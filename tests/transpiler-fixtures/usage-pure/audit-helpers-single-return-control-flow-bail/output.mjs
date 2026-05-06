import _includes from "@core-js/pure/actual/instance/includes";
import _Set from "@core-js/pure/actual/set/constructor";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _Map from "@core-js/pure/actual/map/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
// singleReturnBodyExpression bails on control flow: branches inside the IIFE body cannot
// be statically picked, so the receiver is unresolved and the call site does not dispatch
// a static polyfill on the inline-call result. distinct prototype methods (.includes /
// .findLast / .toReversed) prove per-call no-static-resolution
const a = _includes((() => {
  if (cond) return Array;
  return _Set;
})().prototype);
const b = _findLastMaybeArray((() => {
  try {
    return _Map;
  } catch {
    return _WeakMap;
  }
})().prototype);
const c = _toReversedMaybeArray((() => {
  for (const x of items) return x;
})().prototype);
export { a, b, c };
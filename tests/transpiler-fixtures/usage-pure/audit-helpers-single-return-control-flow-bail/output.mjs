import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _includes from "@core-js/pure/actual/instance/includes";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// Mixed returns and unsupported try/loop bodies keep the original receiver. Prototype reads
// dispatch independently and do not expose the returned constructors' static namespaces.
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
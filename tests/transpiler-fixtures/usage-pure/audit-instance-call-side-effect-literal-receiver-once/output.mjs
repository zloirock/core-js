import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// A DIRECT instance-method call whose receiver is an array literal CONTAINING a side effect (`[fn()]`). the
// receiver is the polyfill's first argument AND the `.call(...)` this-arg, so it must be evaluated EXACTLY
// once - the emitters memoize it into a single `_ref` (`_at...(_ref = [fn()]).call(_ref, 0)`), never
// re-emitting the literal. this is the direct-call twin of the destructure body-extract receiver memo:
// across destructure, direct call, chain and optional chain the receiver is always referenced once
function fn() {
  return 1;
}
export const out = _atMaybeArray(_ref = [fn()]).call(_ref, 0);
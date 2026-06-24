import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A nested optional-chain split reaching the compose path: the inner `arr.flat()` polyfill folds into the
// outer `.at?.(0)` split's prefix half, so they compose as one needle-substituted string. The optional-
// chain suffix stays the trailing slice and is emitted as its own overwrite (keeps fine sourcemap columns).
const arr = [1, 2, 3];
export const r = _atMaybeArray(_ref = _flatMaybeArray(arr).call(arr))?.call(_ref, 0);
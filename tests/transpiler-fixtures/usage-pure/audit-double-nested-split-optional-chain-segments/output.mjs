import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2;
// A DOUBLE-nested optional-chain reaching the compose path: the inner `.at?.(0)` split is itself folded
// into the outer `.flat?.()` split's prefix half. Both optional-call suffixes must keep their own sourcemap
// columns, so the composed string is partitioned by EVERY split (inner and outer), not just the outermost.
const arr = [1, 2, 3];
export const r = _flatMaybeArray(_ref = _atMaybeArray(_ref2 = _flatMaybeArray(arr).call(arr))?.call(_ref2, 0))?.call(_ref);
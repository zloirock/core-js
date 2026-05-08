import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _concatMaybeArray from "@core-js/pure/actual/array/instance/concat";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
// type preservation across 3 intermediate bindings: each step returns Array. the final
// `.at(-1)` dispatches the array-narrowed polyfill, not the generic helper
const a = _Array$from([1]);
const b = _concatMaybeArray(a).call(a, [2]);
const c = _sliceMaybeArray(b).call(b, 0);
_atMaybeArray(c).call(c, -1);
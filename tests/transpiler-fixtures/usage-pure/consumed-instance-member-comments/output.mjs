import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
var _ref, _ref2, _ref3;
// Nested helpers retain inner trivia before outer trivia, including the call boundary.
export const result = _atMaybeArray(_ref = _sliceMaybeArray(_ref2 = [1] /* receiver */ /* connector */ /* property */).call(_ref2, /* argument */0)
/* outer receiver */
/* outer connector */
/* outer property */
).call(_ref, 0);
export const folded = _atMaybeArray(_ref3 = [1] /* folded key */).call(_ref3, 0);
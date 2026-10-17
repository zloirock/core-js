import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// a mutating method retypes elements the same way an element write does - which methods
// mutate is registry data, not local knowledge
const pushed = [[1], [2]];
_pushMaybeArray(pushed).call(pushed, [3]);
export const viaMutatorCall = _at(_ref = pushed[0]).call(_ref, 0);
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// the mutator's ARGUMENT type does not matter - a cross-family push retypes the elements
// exactly like a same-family one, and the later element read still bails to generic
const mixed = [[9]];
_pushMaybeArray(mixed).call(mixed, "x");
export const viaCrossFamilyPush = _at(_ref = mixed[0]).call(_ref, 0);
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
var _ref, _ref2;
// `Self<T = T[]>` has a default that references its own type-param, forming a cycle.
// Substitution must short-circuit on revisit, otherwise depth-bound recursion alone wastes work.
type Self<T = T[]> = { items: T };
declare const r: Self;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = r.items).call(_ref2, p => p);
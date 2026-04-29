import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// cyclic generic default `type R<T = R<T>>`: substitution must not loop and must not
// exhaust the recursion budget. cycle-detection short-circuits on a repeated visit of the
// same alias via the propagated seen-set
type R<T = R<T>> = { value: T };
declare const x: R<number[]>;
_atMaybeArray(_ref = x.value).call(_ref, -1);
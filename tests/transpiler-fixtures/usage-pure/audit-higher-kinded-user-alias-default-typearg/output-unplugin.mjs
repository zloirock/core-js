import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// HKT splice when usage omits X - default `string[]` on the alias param fills in,
// the chain still produces Boxed<string[]> and .at(0) narrows to array
type Boxed<T> = { val: T };
type Wrap<F, X = string[]> = F<X>;
declare const x: Wrap<Boxed>;
_atMaybeArray(_ref = x.val).call(_ref, 0);
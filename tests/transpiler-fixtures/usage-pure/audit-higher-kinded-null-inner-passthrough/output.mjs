import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// HKT apply with type-arg = `null`: the inner resolves to $Primitive('null') which
// `isNullableOrNever` rejects. `safeInnerType` then collapses to null and the rebuilt
// $Object stays generic. `.includes` on the bound container still surfaces an Array
// dispatch, but the inner-element narrow stays generic (matches the parameter)
type Wrap<F, X> = F<X>;
declare const r: Wrap<Array, null>;
_includesMaybeArray(r).call(r, null);
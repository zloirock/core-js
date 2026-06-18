import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// a mapped type whose constraint is a literal union (`{ [K in 'items' | 'name']: V }`) is
// expanded like the `keyof T` form: each member resolves to V. with `Pluck<number[]>` the
// members are `number[]`, so the chained calls dispatch array-specific helpers, not generic
type Pluck<V> = { [K in 'items' | 'name']: V };
declare const r: Pluck<number[]>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = _nameMaybeFunction(r)).call(_ref2, x => true);
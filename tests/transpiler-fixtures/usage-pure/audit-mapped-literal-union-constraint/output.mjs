import _at from "@core-js/pure/actual/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// parseMappedTypeShape requires a TSTypeOperator with operator 'keyof' as constraint.
// Mapped types over a literal union (`{ [K in 'items' | 'name' ]: ... }`) have
// TSUnionType as constraint instead. Resolution falls through to generic dispatch
type Pluck<V> = { [K in 'items' | 'name']: V };
declare const r: Pluck<number[]>;
_at(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = _nameMaybeFunction(r)).call(_ref2, x => true);
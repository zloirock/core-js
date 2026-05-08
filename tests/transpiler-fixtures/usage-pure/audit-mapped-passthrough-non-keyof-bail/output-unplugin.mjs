import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// `{ [K in keyof T]: number[] }` is non-identity body so passthrough must bail.
// Identity-rename expansion still produces concrete members so the array-narrow polyfill is picked.
type Wrap<T> = { [K in keyof T]: number[] };
declare const r: Wrap<{ items: string; name: boolean }>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = _nameMaybeFunction(r)).call(_ref2, x => true);
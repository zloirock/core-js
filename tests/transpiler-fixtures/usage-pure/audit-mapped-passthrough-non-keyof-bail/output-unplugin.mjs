import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2;
// non-passthrough mapped body without `as` rename clause: `{ [K in keyof T]: number[] }`.
// `unwrapMappedTypePassthrough` requires body === `T[K]` exactly, so it bails. the rename
// expansion path treats absent nameType as identity rename (source key passes through),
// applies BODY substitution (`number[]` here is fixed) per source member, and produces
// the typed members. `r.items.at(0)` and `r.name.findLast(...)` resolve through to
// number[] -> array-instance polyfills emit. covers fixed-body shape; T[K]-substituting
// bodies (`Promise<T[K]>`, `T[K][]`) take the same path with non-trivial subst.
//
// observation: `r.name` still triggers the `_nameMaybeFunction(r)` injection from the
// member visitor's separate proxy-global path (where receiver isn't type-checked against
// the resolved object type). that's a different layer; this fixture covers the mapped-
// type rename precision, the Function.prototype.name spurious dispatch is unrelated
type Wrap<T> = { [K in keyof T]: number[] };
declare const r: Wrap<{ items: string; name: boolean }>;
_atMaybeArray(_ref = r.items).call(_ref, 0);
_findLastMaybeArray(_ref2 = _nameMaybeFunction(r)).call(_ref2, x => true);
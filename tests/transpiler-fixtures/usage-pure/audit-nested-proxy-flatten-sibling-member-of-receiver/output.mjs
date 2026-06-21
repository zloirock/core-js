import _Array$from from "@core-js/pure/actual/array/from";
import _Map from "@core-js/pure/actual/map/constructor";
// multi-decl with flattened nested-proxy + sibling member access on the same receiver:
// `globalThis.Map` is a polyfillable global member, so the member-access transform replaces
// the whole `globalThis.Map` range. text-substituting `globalThis` -> `_globalThis` inside it
// would compose to garbage `__Map`; skip the inner substitution when the access is polyfillable
const from = _Array$from;
const y = _Map;
export { from, y };
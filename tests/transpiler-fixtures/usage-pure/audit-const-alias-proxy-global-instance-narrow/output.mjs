import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// a const-alias of a proxy global (`const g = globalThis`) must narrow a chained instance method the
// same as the bare global: `g.Array.from(...)` returns an Array, so `.at(0)` resolves the Array-specific
// `_atMaybeArray` helper, not the generic `_at`. the path-based isGlobalProxy delegates to the node-based
// resolver, which follows the const-alias (and a post-rewrite `_globalThis` alias via its polyfill hint)
const g = _globalThis;
export const r = _atMaybeArray(_ref = _Array$from([1, 2, 3])).call(_ref, 0);
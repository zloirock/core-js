import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => _globalThis;
const aliasedMk = mkRoot;
export const viaCalleeAlias = null == aliasedMk()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(32)).call(_ref, 0);
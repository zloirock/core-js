import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
// an ALIAS of the provable callee follows transitively (identifier hops re-anchor at their
// own declaration scope), so the aliased call proves like the direct one
const mkRoot = () => _globalThis;
const aliasedMk = mkRoot;
// the callee alias still proves under a same-name param SHADOW of the source binding - the
// alias holds the module-level arrow, the shadow never feeds it
export function viaCalleeAliasShadowed(mkRoot) {
  var _ref;
  return null == aliasedMk()?.window ? void 0 : _atMaybeArray(_ref = _Array$of(34)).call(_ref, 0);
}
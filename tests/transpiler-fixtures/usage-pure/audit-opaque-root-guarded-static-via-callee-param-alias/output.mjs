import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
// NEGATIVE: an alias of a PARAM-bound callee is an arbitrary caller value - the chain keeps
// the raw guarded read
const mkRoot = () => _globalThis;
export function viaCalleeParamAlias(mkRoot) {
  var _ref, _ref2;
  const inner = mkRoot;
  return null == (_ref = inner()?.window?.self) ? void 0 : _at(_ref2 = _ref.Array.of(33)).call(_ref2, 0);
}
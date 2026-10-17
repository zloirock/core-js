import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
_globalThis.Array.of = function patched() {
  return [7];
};
let m, q;
export const nestedAssign = null == (m = q = _globalThis.window) ? void 0 : _flatMaybeArray(_ref = m.Array.of(1))?.call(_ref);
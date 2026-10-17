import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A patched static behind a proxy chain keeps its live nullish guard. The memo must capture the potentially absent chain root, not
// an always-defined ponyfill or a sealed tail.
_globalThis.Array.of = function patched() {
  return [7];
};
// an ALIAS value resolves through the same family walk: the aliased `window` is exactly as
// undefinable as the spelled-out nav, so the guard survives here too
const w = _globalThis.window;
let a;
export const aliasValueRoot = null == (a = w) ? void 0 : _flatMaybeArray(_ref = a.Array.of(1))?.call(_ref);
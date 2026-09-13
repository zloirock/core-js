import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2, _ref3;
// A live optional over an opaque root or an excluded realm root keeps its null guard.
// The function-name read still needs its ponyfill, and every key effect runs once.
// A plain key has the same guard obligation as an effect-bearing key.
let c = 0;
function probeHost() {
  return globalThis.window;
}
export const opaqueRootSeKey = null == (_ref = probeHost().window[c++, 'window']) ? void 0 : _nameMaybeFunction(_ref.Array);
export const globalRootSeKey = null == (_ref2 = globalThis.window[c++, 'window']) ? void 0 : _nameMaybeFunction(_ref2.Array);
export const globalRootPlainKey = null == (_ref3 = globalThis.window.window) ? void 0 : _nameMaybeFunction(_ref3.Array);
export const globalRootSeStatic = null == globalThis.window[c++, 'window'] ? void 0 : _Array$of(5);
export const globalRootPlainStatic = null == globalThis.window.window ? void 0 : _Array$of(5);
export { c };
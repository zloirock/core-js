import _Array$of from "@core-js/pure/actual/array/of";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
var _ref, _ref2, _ref3;
// Opaque and excluded roots retain live guards and function-name claims.
// Effectful realm keys keep source navigation; quiet static claims remain supported.
let c = 0;
function probeHost() {
  return globalThis.window;
}
export const opaqueRootSeKey = null == (_ref = probeHost().window[c++, 'window']) ? void 0 : _nameMaybeFunction(_ref.window.Array);
export const globalRootSeKey = null == (_ref2 = globalThis.window[c++, 'window']) ? void 0 : _nameMaybeFunction(_ref2.window.Array);
export const globalRootPlainKey = null == (_ref3 = globalThis.window.window) ? void 0 : _nameMaybeFunction(_ref3.Array);
export const globalRootSeStatic = globalThis.window[c++, 'window']?.window.Array.of(5);
export const globalRootPlainStatic = null == globalThis.window.window ? void 0 : _Array$of(5);
export { c };
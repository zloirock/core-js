import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _globalThis from "@core-js/pure/actual/global-this";
var _ref;
// A computed window read can throw before the assignment reaches its optional consumer.
let root, held;
export const value = null == (_ref = (root = _globalThis, held = root[effect(), 'window'].self)) ? void 0 : _atMaybeArray(_ref.Array.prototype);
export { held };
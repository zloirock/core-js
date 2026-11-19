import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
let p;
export const inDestructureDefault = (({
  x = (() => {
    var _ref;
    return null == (_ref = p = _globalThis.window) ? void 0 : _includesMaybeArray(_ref.Array.prototype);
  })()
} = {}) => x)();
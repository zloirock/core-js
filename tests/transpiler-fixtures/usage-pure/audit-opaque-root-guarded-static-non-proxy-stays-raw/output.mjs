import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// NEGATIVE: a non-proxy call root keeps the whole chain native off the ref
const h = () => ({
  window: {
    Array: {
      of: x => [x, 'custom']
    }
  }
});
export const nonProxyStaysRaw = null == (_ref = h()?.window) ? void 0 : _at(_ref2 = _ref.Array.of(8)).call(_ref2, 0);
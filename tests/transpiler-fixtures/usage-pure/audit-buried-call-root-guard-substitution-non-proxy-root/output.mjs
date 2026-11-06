import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2;
// NEGATIVE: a call root yielding an object of the user's own keeps the chain off the memo - the key
// spelled here is theirs, not the global's, and swapping it in would change which function runs
const plain = () => ({
  window: {
    Math: {
      trunc: x => [x, 'custom']
    }
  }
});
export const nonProxyRoot = null == (_ref = plain()?.window) ? void 0 : _at(_ref2 = _ref.Math.trunc(6.7)).call(_ref2, 0);
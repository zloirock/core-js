import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3;
// a bound (shadowed) possible-global object is NOT a proxy-global: `globalThis` here is a local const,
// so `globalThis.Array.from?.()` reads the local object, the static deopt must NOT fire, and the `?.`
// stays guarded as a plain optional member access. only the trailing `.at` is polyfilled
const globalThis = {
  Array: {
    from: () => [1]
  }
};
export const a = null == (_ref = globalThis.Array, _ref2 = _ref.from) ? void 0 : _at(_ref3 = _ref2.call(_ref)).call(_ref3, 0);
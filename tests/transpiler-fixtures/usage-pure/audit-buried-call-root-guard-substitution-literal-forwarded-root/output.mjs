import _Array$of from "@core-js/pure/actual/array/of";
// a call root FORWARDING the real global through an object literal: the shorthand binding IS
// the global constructor (the container walk descends the returned literal like a const-bound
// one), so the claim resolves and the polyfill lands; the user-object negative above stays raw,
// and a conditionally assigned forwarder keeps its optional call as the guard
const forwards = () => ({
  window: {
    Array
  }
});
export const literalForwardedRoot = null == forwards() ? void 0 : _Array$of(13);
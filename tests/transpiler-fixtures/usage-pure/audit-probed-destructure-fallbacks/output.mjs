import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `||` / `??` FALLBACK rescues the nullish path: a reachable diverging fallback keeps the
// source native, an agreeing ctor fallback keeps the per-branch machinery, and a SEALED left
// THROWS instead of selecting - its dead fallback drops while the probe stays
export const {
  of: viaFallbackObject
} = _globalThis.window?.Array ?? {};
export const {
  of: viaFallbackOr
} = _globalThis.window?.Array || {};
export const {
  of: viaFallbackAgree
} = _globalThis.window?.Array ?? {
  of: _Array$of
};
export const viaFallbackSealed = ((null == _globalThis.window ? void 0 : _self).Array.of, _Array$of);
export const {
  self: {
    Array: {
      of: viaFallbackNested
    }
  }
} = _globalThis.window ?? {};
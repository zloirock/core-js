import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _self from "@core-js/pure/actual/self";
// a `||` / `??` FALLBACK rescues the nullish path: the left swaps for a synth carrying the
// probe's own nullish guard, so a diverging fallback still fires exactly off-env, an agreeing
// ctor fallback keeps the per-branch machinery, and a SEALED left THROWS instead of selecting -
// its dead fallback drops while the probe stays
export const {
  of: viaFallbackObject
} = (null == _globalThis.window ? void 0 : {
  of: _Array$of
}) ?? {};
export const {
  of: viaFallbackOr
} = (null == _globalThis.window ? void 0 : {
  of: _Array$of
}) || {};
export const {
  of: viaFallbackAgree
} = (null == _globalThis.window ? void 0 : {
  of: _Array$of
}) ?? {
  of: _Array$of
};
export const viaFallbackSealed = ((null == _globalThis.window ? void 0 : _self).Array.of, _Array$of);
export const {
  self: {
    Array: {
      of: viaFallbackNested
    }
  }
} = null == _globalThis.window ? {} : {
  self: {
    Array: {
      of: _Array$of
    }
  }
};
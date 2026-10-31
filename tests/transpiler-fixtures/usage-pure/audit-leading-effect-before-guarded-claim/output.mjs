import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map";
import _self from "@core-js/pure/actual/self";
// Leading effects precede guarded claims; ordinary constructor keys keep their effect channel.
// Effectful realm keys retain their native guarded access.
let seq = 0;
export const staticClaim = (seq++, null == _globalThis.window ? void 0 : _Array$of(5));
export const ctorClaim = (seq++, null == _globalThis.window ? void 0 : _Map);
export const navClaim = (seq++, null == _globalThis.window ? void 0 : _Array$of(6));
export const twoEffects = (seq++, seq++, null == _globalThis.window ? void 0 : _Array$of(7));
export const invoked = (seq++, null == _globalThis.window ? void 0 : _Array$from([8]));
export const keyEffectMigrates = _globalThis.window?.[seq++, 'self'].Array.of(9);
export const noEffect = null == _globalThis.window ? void 0 : _Array$of(10);
export const plainClaim = (seq++, (null == _globalThis.window ? void 0 : _self).Array, _Array$of)(11);
const {
  window: W
} = _globalThis;
export const aliasKeyMigrates = null == W ? void 0 : (seq++, _Array$of(12));
export const aliasLeading = (seq++, null == W ? void 0 : _Array$of(13));
let q;
export const aliasAnchored = null == (seq++, q = W) ? void 0 : _Array$of(14);
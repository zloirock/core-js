import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _self from "@core-js/pure/actual/self";
// an effect the source wrote AHEAD of a guarded claim's root has a home of its own: it evaluates
// before the guard test, so it wraps the whole claim. the SE classifier knew only two regions -
// inside the test and between the root and the claim - and a sequence prefix therefore left the
// claim standing down RAW: an unpolyfilled static plus a raw global read on the target engine.
let seq = 0;
export const staticClaim = (seq++, null == _globalThis.window ? void 0 : _Array$of(5));
export const ctorClaim = (seq++, null == _globalThis.window ? void 0 : _Map);
export const navClaim = (seq++, null == _globalThis.window ? void 0 : _Array$of(6));
export const twoEffects = (seq++, seq++, null == _globalThis.window ? void 0 : _Array$of(7));
export const invoked = (seq++, null == _globalThis.window ? void 0 : _Array$from([8]));

// the region between the root and the claim still migrates INTO the guarded branch, in native order
export const keyEffectMigrates = null == _globalThis.window ? void 0 : (seq++, _Array$of(9));
// NEGATIVE: an effect-free prefix has nothing to carry - the claim renders bare
export const noEffect = null == _globalThis.window ? void 0 : _Array$of(10);
// NEGATIVE: the plain (unguarded) claim keeps its own probe spelling
export const plainClaim = (seq++, (null == _globalThis.window ? void 0 : _self).Array, _Array$of)(11);
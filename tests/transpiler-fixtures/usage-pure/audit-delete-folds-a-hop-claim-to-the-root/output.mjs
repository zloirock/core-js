import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// a `delete` reads nothing over its navigation, so the nav folds WHOLE - the hops the source wrote
// optionally with the rest - and the named slot is reached off the ctor the file's own reads land
// on, whatever spells the root; the `?.` left over the substituted binding is vestigial. the
// unreadable key leaves no member polyfill of its own, so every surface here is that one ctor. a
// READ pins the boundary: its probe is live and the guard around it stays - and so does the `?.`
// standing ABOVE a carrier that holds the probe, which decides whether the delete happens at all
const alias = _globalThis;
let kept,
  key,
  held,
  ticks = 0;
function eff() {}
export const viaBareRoot = delete (null == _globalThis.window ? void 0 : _Promise)?.[key];
export const viaAliasRoot = delete (null == alias.window ? void 0 : _Promise)?.[key];
export const viaSequencePrefix = delete (eff(), null == _globalThis.window ? void 0 : _Promise)?.[key];
export const viaKeptWrite = delete (null == (kept = _globalThis).window ? void 0 : _Promise)?.[key];
export const viaPlainHopsUnderAlias = delete _Promise[key];
export const viaPlainHopTail = delete alias[key];
// ... whatever the carrier is and however many effects it runs ahead of the probe: the effects
// re-emit ahead of the guard, which is where the source ran them, and the deleted member's own key
// effect stays with the member - counted together they read as one erasure the swap has to carry
export const viaTwoEffectPrefix = delete (ticks++, ticks++, null == _globalThis.window ? void 0 : _Promise)?.[ticks++, 'noSuchStatic'];
export const viaStoreCarryingTheProbe = delete (null == (held = null == _globalThis.window ? void 0 : _self) ? void 0 : _Promise)?.x;
export const viaReadKeepsTheProbe = null == _globalThis.window ? void 0 : _Promise[key];
export { ticks };
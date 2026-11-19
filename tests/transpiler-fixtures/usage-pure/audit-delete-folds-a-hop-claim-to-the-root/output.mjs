import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise";
import _self from "@core-js/pure/actual/self";
// A `delete` through a realm navigation reaches its slot off the constructor's ponyfill whatever
// spells the root, and an unreadable key adds no polyfill of its own. Hops that are always there fold;
// a `?.` over the `window` probe decides whether the delete happens at all, so its guard stays and
// takes the whole operator. A read of the same navigation keeps the same guard around its value.
const alias = _globalThis;
let kept,
  key,
  held,
  ticks = 0;
function eff() {}
export const viaBareRoot = null == _globalThis.window ? true : delete _Promise[key];
export const viaAliasRoot = null == alias.window ? true : delete _Promise[key];
export const viaSequencePrefix = (eff(), null == _globalThis.window ? true : delete _Promise[key]);
export const viaKeptWrite = null == (kept = _globalThis).window ? true : delete _Promise[key];
export const viaPlainHopsUnderAlias = delete _Promise[key];
export const viaPlainHopTail = delete alias[key];
// effects ahead of the probe run ahead of the guard, where the source runs them, the deleted
// member's key effect stays with the member, and a store holding the probe keeps its own guard
export const viaTwoEffectPrefix = (ticks++, ticks++, null == _globalThis.window ? true : delete _Promise[ticks++, 'noSuchStatic']);
export const viaStoreCarryingTheProbe = null == (held = null == _globalThis.window ? void 0 : _self) ? true : delete _Promise.x;
export const viaReadKeepsTheProbe = null == _globalThis.window ? void 0 : _Promise[key];
export { ticks };
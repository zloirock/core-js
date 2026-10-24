// A `delete` through a realm navigation reaches its slot off the constructor's ponyfill whatever
// spells the root, and an unreadable key adds no polyfill of its own. Hops that are always there fold;
// a `?.` over the `window` probe decides whether the delete happens at all, so its guard stays and
// takes the whole operator. A read of the same navigation keeps the same guard around its value.
const alias = globalThis;
let kept, key, held, ticks = 0;
function eff() {}
export const viaBareRoot = delete globalThis.window?.self?.Promise[key];
export const viaAliasRoot = delete alias.window?.self?.Promise[key];
export const viaSequencePrefix = delete (eff(), globalThis.window?.self)?.Promise[key];
export const viaKeptWrite = delete (kept = globalThis).window?.self?.Promise[key];
export const viaPlainHopsUnderAlias = delete alias.window.self?.Promise[key];
export const viaPlainHopTail = delete alias.window.self?.window[key];
// effects ahead of the probe run ahead of the guard, where the source runs them, the deleted
// member's key effect stays with the member, and a store holding the probe keeps its own guard
export const viaTwoEffectPrefix = delete (ticks++, ticks++, globalThis.window?.self)?.Promise[(ticks++, 'noSuchStatic')];
export const viaStoreCarryingTheProbe = delete (held = globalThis.window?.self)?.Promise.x;
export const viaReadKeepsTheProbe = globalThis.window?.self?.Promise[key];
export { ticks };

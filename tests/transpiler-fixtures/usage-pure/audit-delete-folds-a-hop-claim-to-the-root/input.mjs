// a `delete` reads nothing over its navigation, so the nav folds WHOLE - the hops the source wrote
// optionally with the rest - and the named slot is reached off the ctor the file's own reads land
// on, whatever spells the root; the `?.` left over the substituted binding is vestigial. the
// unreadable key leaves no member polyfill of its own, so every surface here is that one ctor. a
// READ pins the boundary: its probe is live and the guard around it stays - and so does the `?.`
// standing ABOVE a carrier that holds the probe, which decides whether the delete happens at all
const alias = globalThis;
let kept, key, held, ticks = 0;
function eff() {}
export const viaBareRoot = delete globalThis.window?.self?.Promise[key];
export const viaAliasRoot = delete alias.window?.self?.Promise[key];
export const viaSequencePrefix = delete (eff(), globalThis.window?.self)?.Promise[key];
export const viaKeptWrite = delete (kept = globalThis).window?.self?.Promise[key];
export const viaPlainHopsUnderAlias = delete alias.window.self?.Promise[key];
export const viaPlainHopTail = delete alias.window.self?.window[key];
// ... whatever the carrier is and however many effects it runs ahead of the probe: the effects
// re-emit ahead of the guard, which is where the source ran them, and the deleted member's own key
// effect stays with the member - counted together they read as one erasure the swap has to carry
export const viaTwoEffectPrefix = delete (ticks++, ticks++, globalThis.window?.self)?.Promise[(ticks++, 'noSuchStatic')];
export const viaStoreCarryingTheProbe = delete (held = globalThis.window?.self)?.Promise.x;
export const viaReadKeepsTheProbe = globalThis.window?.self?.Promise[key];
export { ticks };

// an instance claim destructured off a parameter default or an IIFE argument that is a literal running
// code (`[eff()]`) is served by the one slot's instance synth like its effect-free twin: the slot spells
// the literal in place, so it runs once, where the default fires, and claims inside it stay live. two
// slots would spell it twice, so they keep the native read, as two slots of an invocation do
export function viaDefault({ at } = [eff()]) { return at; }
export const viaIifeArg = (({ includes }) => includes)([eff(), 2]);
export function viaHopDefault({ w: { findLast } } = { w: [eff()] }) { return findLast; }
export function viaInnerDefault({ w: { flat } = [eff()] }) { return flat; }
export function viaTemplate({ padEnd } = `${ eff() }`) { return padEnd; }
export function viaInnerClaim({ fill } = [Map.groupBy(list, eff)]) { return fill; }
export function twoSlotsStayNative({ toSorted, toReversed } = [eff()]) { return [toSorted, toReversed]; }

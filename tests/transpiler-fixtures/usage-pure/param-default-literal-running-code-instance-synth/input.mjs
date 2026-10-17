// Parameter defaults and caller arguments evaluate their receiver once before instance extraction.
// Whole receiver defaults stay in the parameter list; inner effectful defaults keep their synth.
// Several methods share the supplied receiver without evaluating its default again.
export function viaDefault({ at } = [eff()]) { return at; }
export const viaIifeArg = (({ includes }) => includes)([eff(), 2]);
export function viaHopDefault({ w: { findLast } } = { w: [eff()] }) { return findLast; }
export function viaInnerDefault({ w: { flat } = [eff()] }) { return flat; }
export function viaTemplate({ padEnd } = `${ eff() }`) { return padEnd; }
export function viaInnerClaim({ fill } = [Map.groupBy(list, eff)]) { return fill; }
export function viaTwoSlots({ toSorted, toReversed } = [eff()]) { return [toSorted, toReversed]; }

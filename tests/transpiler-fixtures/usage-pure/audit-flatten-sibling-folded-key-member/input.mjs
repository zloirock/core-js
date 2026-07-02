// a sibling declarator reads the flattened receiver's name under a member whose computed key
// needs the full canonical fold - SE-sequence tail, const-alias identifier, string concat,
// template interpolation, and an SE key selecting a static off a known constructor. the
// natural visitor folds each of these and overwrites a span STARTING at the receiver
// identifier, so the sibling receiver substitution must stand down instead of landing a
// competing rewrite inside that overwrite
let c = 0;
const { Array: { from: f2 } } = globalThis, g2 = globalThis[(c++, 'Map')].groupBy;
export const r = [typeof f2, typeof g2, c];
const k2 = 'Set';
const { Array: { of: o2 } } = globalThis, S2 = globalThis[k2];
export const s = [typeof o2, typeof S2];
const { Object: { entries: en } } = globalThis, P2 = globalThis['Pro' + 'mise'];
export const p = [typeof en, typeof P2.resolve];
const part = 'bol';
const { Object: { values: va } } = globalThis, Y2 = globalThis[`Sym${part}`];
export const y = [typeof va, typeof Y2.iterator];
let d = 0;
const { Object: { assign: as } } = globalThis, fe = globalThis.Object[(d++, 'fromEntries')];
export const f = [typeof as, typeof fe, d];

// a destructure whose init is a sequence ending in an effect-free receiver (a proxy-member chain or a
// bare constructor) that the claims consume whole: the effect lifts into a statement of its own and
// the dead tail drops. an export host and a multi-declarator list lift per declarator.
const { of: o3 } = (eff2(), globalThis.Array);
export const r3 = o3(2);
const { all } = (eff4(), Promise);
export const r4 = all;
export const { keys } = (effA(), globalThis.Object);
const { from: f5 } = (e1(), globalThis.Array), { entries } = (e2(), globalThis.Object);
export const r5 = [f5, entries];

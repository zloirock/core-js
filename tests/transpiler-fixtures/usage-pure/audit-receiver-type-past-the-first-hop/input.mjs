// the receiver's type survives past the FIRST property hop: a two-hop read narrows like a one-hop
// one, and a leaf that provably carries the name itself pulls nothing at all. `at` is what makes
// the row say WHICH family answered - array and string both carry it, so a lost type is visible as
// the generic dispatcher rather than as silence
const depth = { one: { two: 'abc' }, arr: { two: [1, [2]] }, own: { two: { at: 1 } } };
export const s = depth.one.two.at(0);
export const a = depth.arr.two.at(0);
export const p = depth.own.two.at;
// ... and the DESTRUCTURING spelling of the same read answers the same: the pattern reaches the slot
// by the keys it names, and a carrier read that way hands nothing out for a writer to reach
const { one: { two: { at: s2 } } } = depth;
const { own: { two: { at: p2 } } } = depth;
// ... and a GETTER hop is one more step of the same walk: the getter names its value through the
// return, and a literal written INLINE there is built fresh per read, so the slot below it reads off
// the literal itself. the rows pin both answers - the family where the leaf has one, silence where
// the leaf carries the name itself
const boxed = { get one() { return { two: 'abc' }; }, get own() { return { two: { at: 1 } }; } };
export const s3 = boxed.one.two.at(0);
export const p3 = boxed.own.two.at;
export { s2, p2 };

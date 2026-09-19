// the receiver's type survives past the FIRST property hop: a two-hop read narrows like a one-hop
// one, and a leaf that provably carries the name itself pulls nothing at all. one method per line -
// injection here is observable only through the import set, so two lines sharing a method would
// mask each other
const depth = { one: { two: 'abc' }, arr: { two: [1, [2]] }, own: { two: { includes: 1 } } };
export const s = depth.one.two.at(0);
export const a = depth.arr.two.flat();
export const p = depth.own.two.includes;

// a mirrored arm whose read off a static container crosses a `?.` - dead text over the container, which is never
// nullish - reads its other keys past a sealed chain, the spelling the read keeps wherever the `?.` could fire
const box = { U: Map };
const bb = { W: { U: Map } };
export const { groupBy, prototype } = globalThis.c ? box?.U : Object;
export const { groupBy: deepGroupBy, prototype: deepPrototype } = globalThis.c ? bb?.W.U : Object;
export const { groupBy: innerGroupBy, prototype: innerPrototype } = globalThis.c ? bb.W?.U : Object;

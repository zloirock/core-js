// a name some write reassigns is read through the identity guard its writes register, and so is a plain
// alias of it; an alias of a selection of it with another value holds what no such guard names, so the read
// stays as written and the constructor takes its whole entry - a written for-of head and a written binding,
// selected by `??`, `||` or a ternary, one constructor per row. a plain alias keeps the guard
const iterated = [];
for (let X of [Iterator, Array]) {
  if (iterated.length) X = null;
  const held = X ?? Object;
  iterated.push(typeof held.from);
}
export { iterated };
let M = Map;
if (globalThis.c) M = null;
const maps = M || Object;
export const grouped = maps.groupBy([1, 2], x => x % 2);
let P = Promise;
if (globalThis.c) P = null;
const promises = globalThis.d ? Object : P;
export const resolvers = typeof promises.withResolvers;
let U = URL;
if (globalThis.c) U = null;
const urls = U;
export const parsable = urls.canParse('x:');

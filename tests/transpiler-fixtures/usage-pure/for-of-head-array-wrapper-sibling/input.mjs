// A for-of head has no statement slot for a residual extraction, so a static read through a
// multi-element array wrapper takes the head mirror: the iterated literal's element carries the
// polyfill and the sibling slot keeps its own effect in source order.
const log = [];
const eff = t => (log.push(t), t);
const out = [];
for (const [{ from }, tail] of [[Array, eff(1)], [Array, eff(2)]]) out.push(from([1]).length, tail);
for (let [{ of }, count] of [[Array, 1]]) out.push(of(1).length, count);
for (const [{ Array: { isArray } }, tail] of [[globalThis, eff(3)]]) out.push(isArray([]), tail);
for (const [[{ from }], tail] of [[[Array], 4]]) out.push(from([1]).length, tail);
export { out, log };

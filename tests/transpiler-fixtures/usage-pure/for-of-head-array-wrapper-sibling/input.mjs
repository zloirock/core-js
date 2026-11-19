// For-of array heads retain native static reads and neighbouring elements.
// The iterable evaluates its effects before iteration and body push calls stay served.
const log = [];
const eff = t => (log.push(t), t);
const out = [];
for (const [{ from }, tail] of [[Array, eff(1)], [Array, eff(2)]]) out.push(from([1]).length, tail);
for (let [{ of }, count] of [[Array, 1]]) out.push(of(1).length, count);
for (const [{ Array: { isArray } }, tail] of [[globalThis, eff(3)]]) out.push(isArray([]), tail);
for (const [[{ from }], tail] of [[[Array], 4]]) out.push(from([1]).length, tail);
export { out, log };

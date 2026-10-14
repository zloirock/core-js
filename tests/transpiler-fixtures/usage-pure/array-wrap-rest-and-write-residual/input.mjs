// A static extracted beside an object rest or a sibling keeps its initializer's effects and writes:
// a bare effect prefix runs first as a statement of its own, while a write stays where the source
// wrote it - in the wrapper's slot, which then hands the claim and its sibling a literal of their
// own, or in the residual's initializer. The flat forms are the twins the wrapped rows answer to.
const seen = [];
const eff = t => (seen.push(t), t);
let kw;
const [{ Object: { fromEntries, ...restA } }] = [(eff('a'), globalThis)];
const [{ Object: { entries }, other }] = [kw = (eff('b'), globalThis), 7];
// the flat twins: the bare prefix runs first, the write stays in the residual's initializer
const { Object: { hasOwn, ...restB } } = (eff('c'), globalThis);
const { Object: { keys, ...restC } } = (kw = (eff('d'), globalThis));
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };

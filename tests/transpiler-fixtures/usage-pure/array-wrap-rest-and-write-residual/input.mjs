// Claimed statics retain their polyfills beside object rest.
// Rest keeps its source and exclusions; instance slots remain native.
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
const [{ Object: { fromEntries, ...restA } }] = [(eff('a'), globalThis)];
// a verbatim SIBLING keeps it too; a kept write stays in the slot, the extraction stands ahead
const [{ Object: { entries }, other }] = [kw = (eff('b'), globalThis), 7];
// the FLAT twins anchor on the hop's own surface, prefix replayed inside, write kept inside
const { Object: { hasOwn, ...restB } } = (eff('c'), globalThis);
const { Object: { keys, ...restC } } = (kw = (eff('d'), globalThis));
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };

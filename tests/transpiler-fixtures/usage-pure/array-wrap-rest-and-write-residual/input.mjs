// what an array wrapper leaves behind when the claim is a receiver-less static and a REST or a
// verbatim sibling keeps the residual, one spelling on both legs: the element's own PREFIX lifts
// ahead of the extraction, a kept WRITE stays in that residual (the source performs it there,
// and nothing reads it twice), and the flat twins anchor on the hop's own surface
const seen = [];
const eff = t => (seen.push(t), t);
const xs = [1];
let kw;
// an INNER rest keeps the residual; the element's prefix lifts and the slot reads the quiet tail
const [{ Object: { fromEntries, ...restA } }] = [(eff('a'), globalThis)];
// a verbatim SIBLING keeps it too; a kept write stays in the slot, the extraction stands ahead
const [{ Object: { entries }, other }] = [kw = (eff('b'), globalThis), 7];
// the FLAT twins anchor on the hop's own surface, prefix replayed inside, write kept inside
const { Object: { hasOwn, ...restB } } = (eff('c'), globalThis);
const { Object: { keys, ...restC } } = (kw = (eff('d'), globalThis));
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };

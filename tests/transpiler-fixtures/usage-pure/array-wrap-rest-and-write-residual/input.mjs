// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
let kw;
const [{ Object: { fromEntries, ...restA } }] = [(eff('a'), globalThis)];
const [{ Object: { entries }, other }] = [kw = (eff('b'), globalThis), 7];
const { Object: { hasOwn, ...restB } } = (eff('c'), globalThis);
const { Object: { keys, ...restC } } = (kw = (eff('d'), globalThis));
export { fromEntries, restA, entries, other, hasOwn, restB, keys, restC, seen, kw };

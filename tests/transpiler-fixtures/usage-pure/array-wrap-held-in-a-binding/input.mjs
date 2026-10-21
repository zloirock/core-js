// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering. Instance claims retain their own receivers.
const seen = [];
const eff = t => (seen.push(t), t);
const wrap = [(eff('h'), globalThis), eff('i')];
const [{ Reflect: { ownKeys } }] = wrap;
const wrap2 = [[(eff('j'), globalThis), eff('k')]];
const [[{ Object: { entries } }]] = wrap2;
const w3 = [globalThis];
const [[{ Object: { hasOwn } }]] = [w3, eff('m')];
export { ownKeys, entries, hasOwn, seen };

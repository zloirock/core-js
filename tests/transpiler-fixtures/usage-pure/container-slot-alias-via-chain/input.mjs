// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = { w: Object, y: [1] };
const out = [];
const chainA = r.w;
const chainB = chainA;
const viaChain = chainB.values;
out.push(viaChain);
export { out };

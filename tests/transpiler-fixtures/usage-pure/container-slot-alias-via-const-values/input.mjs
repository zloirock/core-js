// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = { w: Object, y: [1] };
const out = [];
const viaConst = r.w;
const viaConstValues = viaConst.values;
out.push(viaConstValues);
export { out };

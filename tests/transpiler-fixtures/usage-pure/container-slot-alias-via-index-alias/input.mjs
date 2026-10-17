// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = { w: Object, y: [1] };
const out = [];
const box = [r];
const indexAlias = box[0];
const viaIndexAlias = indexAlias.w.values;
out.push(viaIndexAlias);
export { out };

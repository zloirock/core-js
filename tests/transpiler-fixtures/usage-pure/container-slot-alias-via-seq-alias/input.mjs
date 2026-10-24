// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = { w: Object, y: [1] };
function eff() { return 0; }
const out = [];
const seqAlias = (eff(), r.w);
const viaSeqAlias = seqAlias.entries;
out.push(viaSeqAlias);
export { out };

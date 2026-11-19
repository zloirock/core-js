// A slot alias captures the value its initializer reads. Read-only aliases and nested wrappers preserve static and instance
// precision; writes and escapes affect only the value they can reach.
const r = { w: Object, y: [1] };
function eff() { return 0; }
const out = [];
var _ref = [eff(), r], _ref$ = _ref[1], _ref$$w = _ref$.w, viaLoweredWrapper = _ref$$w.values;
out.push(viaLoweredWrapper);
export { out };

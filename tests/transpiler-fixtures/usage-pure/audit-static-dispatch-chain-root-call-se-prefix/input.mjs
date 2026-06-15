// static-method dispatch on a chain rooted in a side-effecting call buried under a SequenceExpression
// prefix: `(eff(), mk()).Array.from(x)`. the receiver chain collapses to the polyfill, but the prefix
// effect AND the root call must still run, in source order, ahead of the dispatch
const log = [];
function mk() { log.push('mk'); return globalThis; }
const r = (log.push('pre'), mk()).Array.from([1, 2]);
export { r };

// the chain-root call of a folded `in` receiver is buried in a SequenceExpression tail
// (`(eff(), mk()).Array`). the fold discards the receiver, but `mk()` carries an observable effect
// and must still run - earlier the sequence wrapper hid it from the chain-root probe and it was
// dropped. the leading push (sequence prefix) and `mk()` (sequence tail) both run, in source order
const log = [];
function mk() { log.push(2); return globalThis; }
const r = 'from' in (log.push(1), mk()).Array;
export { r };

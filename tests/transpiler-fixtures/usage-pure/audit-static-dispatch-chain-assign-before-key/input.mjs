// static-method dispatch on a chain-assignment receiver with a side-effecting COMPUTED KEY. per
// ECMA the object `(a = Array)` evaluates before the computed key `(eff(), 'from')`, so the rescued
// chain-assignment must precede the key effect in the prelude: `(a = Array, eff(), _from)(...)`.
// earlier the chain-assign was appended last, running the key effect before the receiver assignment
let a;
const log = [];
const r = (a = Array)[(log.push(1), 'from')]([9]);
export { r, a };

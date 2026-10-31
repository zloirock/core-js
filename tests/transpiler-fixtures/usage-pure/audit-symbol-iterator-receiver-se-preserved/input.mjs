// `recv[Symbol.iterator]()` with a receiver-side SequenceExpression `(fnRuns++, [1,2,3])` and
// no key-SE. the receiver's `fnRuns++` must run exactly once, before the get-iterator call:
// the sequence keeps its prefix before the iterator lookup and call, without duplicating
// or reordering it.
let fnRuns = 0;
const r = (fnRuns++, [1, 2, 3])[Symbol.iterator]();

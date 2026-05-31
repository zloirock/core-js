// `recv[Symbol.iterator]()` with a receiver-side SequenceExpression `(fnRuns++, [1,2,3])` and
// no key-SE. the receiver's `fnRuns++` must run exactly once, before the get-iterator call:
// the receiver is peeled to its tail and the prefix re-emits around the call, so the SE is
// preserved without being duplicated or reordered.
let fnRuns = 0;
const r = (fnRuns++, [1, 2, 3])[Symbol.iterator]();

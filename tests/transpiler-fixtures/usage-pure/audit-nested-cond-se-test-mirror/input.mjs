// an EFFECTFUL ternary test must keep running: the flatten bails (it would drop the test),
// the mirror unfolds both branches, and the native test picks per evaluation
let log = [];
let c = true;
const { Array: { from } } = (log.push(1), c) ? globalThis : self;
from([1]);

// a DISCARDED read whose spine roots in an effectful sequence re-emits WHOLE, the read included -
// the source performed it after the effect, and the member above the sequence is not the dead
// proxy nav the drop gate retires; a read the sequence does not root keeps its trimmed shape
let n = 0;
const holder = { M: Map };
const { groupBy: fromHolder } = (n++, holder).M;
const { from: fromRealm } = (n++, globalThis).Array;
const { fromEntries: fromTail } = (n++, globalThis.Object);
use(fromHolder, fromRealm, fromTail);

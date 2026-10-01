// an ASSIGNMENT host and the computed-key reads keep a getter-read prefix element the way the
// declaration hosts do: in the rescue the discard owes, and in a key or a receiver whose sequence the
// fold collapses - in the order the source ran each
class K { static get g() { log(); return 0; } }
function mkObject() { log(); return Object; }
let a2;
({ groupBy: a2 } = (K.g, mkObject()));
const iter = [1, 2][(K.g, Symbol.iterator)];
const folded = (K.g, globalThis).Math.sumPrecise;
const receiverIter = [1, 2][(K.g, globalThis).Symbol.asyncIterator];
use(a2, iter, folded, receiverIter);

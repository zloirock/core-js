// A conditionally reassigned receiver keeps native siblings in property order.
// Capturing an instance sibling permits the middle static to use its identity guard;
// the constructor namespace supplies any static the pattern still reads natively.
let M = Map;
if (n) M = { groupBy: 7, name: 'x' };
const { a1, groupBy: s1, name: nm1 } = M;
let P = Promise;
if (n) P = {};
let a2, t2, nm2;
({ a2, try: t2, name: nm2 } = P);
let I = Iterator;
if (n) I = {};
const { name: nm3, from: f3 } = I;
use(a1, s1, nm1, a2, t2, nm2, nm3, f3);

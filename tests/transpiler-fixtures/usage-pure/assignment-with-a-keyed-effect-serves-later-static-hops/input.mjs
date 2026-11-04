// The keyed assignment and its declaration twin each serve the later static in one pass.
// The member receiver is evaluated once, and its original keys determine the read order.
const ns = { box: { w: Array, n: Number } };
let from, isInteger;
({ w: { [(e(), 'from')]: from }, n: { isInteger } } = ns.box);
use(from, isInteger);
const { w: { [(e(), 'from')]: declaredFrom }, n: { isInteger: declaredIsInteger } } = ns.box;
use(declaredFrom, declaredIsInteger);

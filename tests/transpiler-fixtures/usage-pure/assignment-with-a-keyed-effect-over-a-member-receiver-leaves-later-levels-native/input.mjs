// an assignment over a member receiver whose keyed level carries an effectful computed key extracts that
// level and leaves the levels after it on the native residual: `isInteger` stays native there (an accepted
// gap of the assignment host), while the same pattern declared serves both
const ns = { box: { w: Array, n: Number } };
let from, isInteger;
({ w: { [(e(), 'from')]: from }, n: { isInteger } } = ns.box);
use(from, isInteger);
const { w: { [(e(), 'from')]: declaredFrom }, n: { isInteger: declaredIsInteger } } = ns.box;
use(declaredFrom, declaredIsInteger);

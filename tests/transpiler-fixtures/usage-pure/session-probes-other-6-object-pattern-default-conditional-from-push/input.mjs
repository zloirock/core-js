// A defaulted sibling runs before the native selecting from read in its literal object.
// The later static comparison and push call remain independently served.
let pick = 1;
const userObj = {};
const log = [];
function eff() { return Object; }
{
const { a: eff1 = eff(), w: { from: f } } = { a: undefined, w: pick ? Array : userObj }; log.push(f === Array.from, eff1);
}

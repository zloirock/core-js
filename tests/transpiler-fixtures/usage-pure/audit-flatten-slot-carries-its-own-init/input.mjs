// Each destructure initializer and its sequence effects run once at the original declaration slot.
// Claimed and residual siblings retain their own computed-key effects and polyfill rewrites.
let k = 0;
let k4 = 0;
function log() {}
function eff() {}
function getArr() { return [1]; }
const { Array: { from } } = globalThis, { at, concat } = (log(), getArr());
const { Array: { of } } = globalThis, { indexOf, [(k++, 'flat')]: fl } = getArr();
var { Object: { entries: f4 } } = globalThis, { [(k4++, 'of')]: of4, other4 } = (eff(), Array);
export { from, at, concat, of, indexOf, fl, f4, of4, other4 };

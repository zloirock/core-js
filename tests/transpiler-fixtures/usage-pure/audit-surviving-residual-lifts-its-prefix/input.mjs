// a SURVIVING residual keeps the receiver, so the extraction is emitted ahead of it - and the
// source ran the receiver's sequence prefix before either. the prefix lifts to where the source
// ran it, and the residual reads the bare tail; leaving it behind let the effect observe the
// write the extraction had already made. the nav tail and the export host take the same lift, and
// so does a prop whose OWN computed key carries an effect - that key runs where it stands, second.
function eff() {}
let mm, oo;
({ Map: mm, other: oo } = (eff(), globalThis));
var { Set: vs, alsoOther } = (eff(), globalThis);
export const { from: nf, isArray } = (eff(), globalThis.Array);
export const { WeakMap: xw, stillOther } = (eff(), globalThis);
let k = 0;
const { [(k++, 'fr') + 'om']: kf } = (eff(), Array);
export const r = [mm, oo, vs, alsoOther, nf, isArray, xw, stillOther, kf, k];

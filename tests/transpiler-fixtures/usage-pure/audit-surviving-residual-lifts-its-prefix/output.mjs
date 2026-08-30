import _Array$from from "@core-js/pure/actual/array/from";
import _globalThis from "@core-js/pure/actual/global-this";
import _Map from "@core-js/pure/actual/map/constructor";
import _Set from "@core-js/pure/actual/set/constructor";
import _WeakMap from "@core-js/pure/actual/weak-map/constructor";
// a SURVIVING residual keeps the receiver, so the extraction is emitted ahead of it - and the
// source ran the receiver's sequence prefix before either. the prefix lifts to where the source
// ran it, and the residual reads the bare tail; leaving it behind let the effect observe the
// write the extraction had already made. the nav tail and the export host take the same lift, and
// so does a prop whose OWN computed key carries an effect - that key runs where it stands, second.
function eff() {}
let mm, oo;
eff();
mm = _Map;
({
  other: oo
} = _globalThis);
eff();
var vs = _Set;
var {
  alsoOther
} = _globalThis;
eff();
export const nf = _Array$from;
export const {
  isArray
} = _globalThis.Array;
eff();
export const xw = _WeakMap;
export const {
  stillOther
} = _globalThis;
let k = 0;
eff();
const kf = _Array$from;
const {
  [(k++, 'fr') + 'om']: _unused
} = Array;
export const r = [mm, oo, vs, alsoOther, nf, isArray, xw, stillOther, kf, k];
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// a SURVIVING residual keeps the receiver, so the extraction is emitted ahead of it - and the
// source ran the receiver's sequence prefix before either. the prefix lifts to where the source
// ran it, and the residual reads the bare tail; leaving it behind let the effect observe the
// write the extraction had already made. the nav tail and the export host take the same lift, and
// so does a prop whose OWN computed key carries an effect - that key runs where it stands, second.
function eff() {}
let mm, oo;
({
  Map: mm,
  other: oo
} = (eff(), globalThis));
var {
  Set: vs,
  alsoOther
} = (eff(), globalThis);
export const {
  from: nf,
  isArray
} = (eff(), globalThis.Array);
export const {
  WeakMap: xw,
  stillOther
} = (eff(), globalThis);
let k = 0;
const {
  [(k++, 'fr') + 'om']: kf
} = (eff(), Array);
export const r = [mm, oo, vs, alsoOther, nf, isArray, xw, stillOther, kf, k];
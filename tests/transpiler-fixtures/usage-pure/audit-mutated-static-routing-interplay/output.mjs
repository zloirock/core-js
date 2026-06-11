import _Iterator from "@core-js/pure/actual/iterator/constructor";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map/constructor";
import _Map$groupBy from "@core-js/pure/actual/map/group-by";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _Promise$try from "@core-js/pure/actual/promise/try";
// mutated-static routing composes with the surrounding machineries: an SE-buried write keeps
// its prefix around the routed receiver, an in-check receiver routes inside its sequence, a
// destructure default stays on the raw pattern. a receiver whose global EXISTS on the target
// (Object) stays native on EVERY surface - the patch and the reads agree either way
(eff(), _Iterator).from = c1;
export const r1 = _Iterator.from(y);
_Promise.try = c2;
export const r2 = 'try' in (eff2(), _Promise);
_Map.groupBy = c3;
const {
  groupBy = fb
} = _Map;
export const r3 = groupBy(items, fn);
Object.groupBy = c4;
function take({
  groupBy: og
} = Object) {
  return og;
}
export const r4 = take();
// the patch flows through aliasing and inheritance off the routed constructor
const I = _Iterator;
export const r5 = I.from(z);
class K extends _Iterator {
  static make() {
    return super.from(w);
  }
}
export const r6 = K.make();
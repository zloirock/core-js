import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.set.constructor";
import "core-js/modules/es.set.species";
import "core-js/modules/es.set.difference";
import "core-js/modules/es.set.intersection";
import "core-js/modules/es.set.is-disjoint-from";
import "core-js/modules/es.set.is-subset-of";
import "core-js/modules/es.set.is-superset-of";
import "core-js/modules/es.set.symmetric-difference";
import "core-js/modules/es.set.union";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A default on a static the build serves still runs where its slot may read `undefined`: off a name a
// write may point elsewhere, off a selection whose other arm lacks the static, over a slot the file
// writes, on a line the user opted out of. A write in it reaches a later read, which loads the modules
// that write brings.
let a = [1],
  b = [2],
  c = 'ef',
  d = 'gh';
let R = Array;
if (flag) R = Set;
const {
  from = (a = 'ab', 0)
} = R;
const {
  of = (b = 'cd', 0)
} = flag ? Array : Math;
Promise.allSettled = shim;
const {
  allSettled = (c = [3], 0)
} = Promise;
// core-js-disable-next-line
const {
  entries = (d = [4], 0)
} = Object;
export const reads = [a.at(0), b.includes(1), c.flat(), d.toReversed()];
export { from, of, allSettled, entries };
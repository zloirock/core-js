import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.chunks";
import "core-js/modules/es.iterator.concat";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.iterator.join";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.iterator.windows";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/web.dom-collections.iterator";
// A write in a realm key's dead default reaches no later read, whichever render drops the default: a level
// anchored on the constructor's ponyfill, a level a rest beside it splits off. A consumed assignment's value keeps
// reading the realm itself, where pure installs nothing: its default stays, and so does the write in it, live
// on an engine lacking the global - in usage-global the build fills that slot, and the write dies there too.
let a = 'ab',
  b = 'cd',
  c = 'ef',
  concat;
const {
  WeakMap: {
    custom
  } = (a = [1], Set)
} = globalThis;
const {
  Promise: {
    allSettled
  } = (b = [2], WeakSet),
  ...rest
} = globalThis;
use({
  Iterator: {
    concat
  } = (c = [3], DOMException)
} = globalThis);
export const reads = [a.flat(), b.findLast(Boolean), c.toReversed()];
export { custom, allSettled, rest, concat };
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.group-by";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.try";
import "core-js/modules/es.promise.with-resolvers";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.find-last";
import "core-js/modules/es.array.find-last-index";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.sort";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.to-reversed";
import "core-js/modules/es.array.to-sorted";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.iterator.drop";
import "core-js/modules/es.iterator.every";
import "core-js/modules/es.iterator.filter";
import "core-js/modules/es.iterator.find";
import "core-js/modules/es.iterator.flat-map";
import "core-js/modules/es.iterator.for-each";
import "core-js/modules/es.iterator.from";
import "core-js/modules/es.iterator.map";
import "core-js/modules/es.iterator.reduce";
import "core-js/modules/es.iterator.some";
import "core-js/modules/es.iterator.take";
import "core-js/modules/es.iterator.to-array";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.string.iterator";
import "core-js/modules/esnext.iterator.chunks";
import "core-js/modules/esnext.iterator.includes";
import "core-js/modules/esnext.iterator.join";
import "core-js/modules/esnext.iterator.windows";
import "core-js/modules/web.dom-collections.iterator";
// a conditionally reassigned computed-key alias on an UNRESOLVED receiver (a local instance)
// unions its reachable keys through the typeless dispatch the primary key already gets: every
// reachable branch may run at runtime, so each earns its side-effect import (over-inject-safe).
// covers: the reachable alternative beside a resolvable primary; a reachable key whose PRIMARY
// resolves nothing; the receiver-AND-key cross product where the alias also reaches a known
// constructor; and the no-reassignment negative (no extras beyond the primary). destructuring
// reads the same reachable targets, so its forms union identically: a reassigned key alias on a
// local receiver, a reassigned key on a KNOWN constructor, and a receiver alias reaching a
// constructor whose static the pattern extracts. the `in` operator unions too: its RESULT
// depends on the injected polyfill, so every reachable key / receiver earns its import.
// a static-context `this[k]` resolves each reachable key through the inherited-static remap
// with the CANDIDATE's key (a node re-read would collapse every extra back to the primary)
let k = 'at';
if (c) k = 'flat';
const arr = [1, 2];
export const both = arr[k];
let dead = 'zzz';
if (c) dead = 'includes';
export const reachableOnly = arr[dead];
let mixedKey = 'indexOf';
if (c) mixedKey = 'from';
var recv = [3];
if (d) recv = Array;
export const crossProduct = recv[mixedKey];
const fixed = 'lastIndexOf';
export const noUnion = arr[fixed];
let dKey = 'findLast';
if (c) dKey = 'findLastIndex';
const {
  [dKey]: extracted
} = arr;
export const viaDestructure = extracted;
let sKey = 'groupBy';
if (c) sKey = 'from';
const {
  [sKey]: staticExtract
} = Map;
export const viaStaticDestructure = staticExtract;
var recvAlias = [4];
if (d) recvAlias = Iterator;
const {
  from: iterFrom
} = recvAlias;
export const viaRecvUnion = iterFrom;
let inKey = 'groupBy';
if (c) inKey = 'fromEntries';
export const viaIn = inKey in Object;
let thisKey = 'try';
if (c) thisKey = 'withResolvers';
class P extends Promise {
  static viaThisUnion() {
    return this[thisKey];
  }
}
export const viaThis = P.viaThisUnion();
let protoKey = 'toReversed';
if (c) protoKey = 'toSorted';
export const viaPrototype = Array.prototype[protoKey];
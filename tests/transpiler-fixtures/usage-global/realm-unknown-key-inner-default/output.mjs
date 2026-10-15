import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.from-entries";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.from-async";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.of";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.map.constructor";
import "core-js/modules/es.map.species";
import "core-js/modules/es.map.group-by";
import "core-js/modules/es.map.get-or-insert";
import "core-js/modules/es.map.get-or-insert-computed";
import "core-js/modules/es.math.sum-precise";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.string.raw";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// Unknown realm slots keep live defaults. Both their values and their fallbacks need instance
// patches; known globals still supply the named constructor or namespace.
function use() {/* empty */}
const {
  UserMaps: {
    groupBy
  } = Map
} = globalThis;
let fromAsync;
({
  UserArrays: {
    fromAsync
  } = Array
} = globalThis);
for (const {
  UserPromises: {
    allSettled
  } = Promise
} of [globalThis]) use(allSettled);
const [{
  UserObjects: {
    fromEntries
  } = Object
}] = [globalThis];
const key = 'UserStrings';
const {
  [key]: {
    raw
  } = String
} = globalThis;
const {
  self: {
    UserNumbers: {
      isInteger
    } = Number
  } = {}
} = globalThis;
const realm = globalThis;
const {
  UserOwners: {
    hasOwn
  } = Object
} = realm;
const {
  userLists: {
    of
  } = Array
} = globalThis;
const {
  userRanges: {
    at
  } = [1, 2]
} = globalThis;
const [{
  self: {
    userFinders: {
      includes
    } = [1, 2]
  }
}] = [globalThis];
const {
  Math: {
    sumPrecise
  } = {}
} = globalThis;
use(groupBy, fromAsync, fromEntries, raw, isInteger, hasOwn, of, at, includes, sumPrecise);
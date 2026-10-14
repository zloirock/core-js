import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.assign";
import "core-js/modules/es.object.get-own-property-symbols";
import "core-js/modules/es.object.has-own";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.global-this";
import "core-js/modules/es.number.constructor";
import "core-js/modules/es.number.is-integer";
import "core-js/modules/es.string.iterator";
// A hop's own default under an `&&` guard is live: a falsy guard reads that default instead of the
// realm's constructor, so the static under the hop may be the default's and not the constructor's.
// The read stays as written - in a declaration, beside a rest and in an assignment whose value is read.
let w, isInteger, read;
const {
  Array: {
    from
  } = {}
} = w = m && globalThis;
const {
  Object: {
    hasOwn,
    ...objects
  } = {}
} = guard && globalThis;
read = {
  Number: {
    isInteger
  } = {}
} = flag && globalThis;
export { from, hasOwn, objects, isInteger, read, w };
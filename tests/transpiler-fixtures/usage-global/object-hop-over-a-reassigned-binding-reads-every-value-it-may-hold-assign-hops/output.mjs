import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.async-dispose";
import "core-js/modules/es.symbol.async-iterator";
import "core-js/modules/es.symbol.dispose";
import "core-js/modules/es.symbol.for";
import "core-js/modules/es.symbol.has-instance";
import "core-js/modules/es.symbol.is-concat-spreadable";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.symbol.key-for";
import "core-js/modules/es.symbol.match";
import "core-js/modules/es.symbol.match-all";
import "core-js/modules/es.symbol.replace";
import "core-js/modules/es.symbol.search";
import "core-js/modules/es.symbol.species";
import "core-js/modules/es.symbol.split";
import "core-js/modules/es.symbol.to-primitive";
import "core-js/modules/es.symbol.to-string-tag";
import "core-js/modules/es.symbol.unscopables";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.async-iterator.async-dispose";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array-buffer.species";
import "core-js/modules/es.date.to-primitive";
import "core-js/modules/es.function.has-instance";
import "core-js/modules/es.global-this";
import "core-js/modules/es.iterator.dispose";
import "core-js/modules/es.json.to-string-tag";
import "core-js/modules/es.math.to-string-tag";
import "core-js/modules/es.regexp.species";
import "core-js/modules/es.string.iterator";
import "core-js/modules/es.typed-array.species";
import "core-js/modules/web.dom-collections.iterator";
import "core-js/modules/web.self";
// a REASSIGNED binding in the slot answers through the flat canon - its write enumeration, the reachable
// union - on every host: a branching realm write (`window || globalThis`) and a non-realm value in the
// chain enumerate what the flat spelling enumerates, so a constructor key loads its family, while a key
// the realm never dispatches loads an instance method only where a non-realm value may hold it
const other = {};
let orRealm = globalThis;
orRealm = window || globalThis;
var later = globalThis;
later = self;
if (flag) later = other;
function assignHops() {
  // The call below is inside an exported container, so its returned Symbol namespace escapes.
  let m;
  let n;
  ({
    w: {
      toSpliced: m
    }
  } = {
    w: orRealm
  });
  ({
    w: {
      Symbol: n
    }
  } = {
    w: later
  });
  return [m, n];
}
export default [assignHops()];
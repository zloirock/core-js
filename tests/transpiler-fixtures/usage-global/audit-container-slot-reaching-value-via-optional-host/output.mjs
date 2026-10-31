import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.race";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// an OPTIONAL host spelling reads the same slot - the walk sees through the `?.`
const cO = {
  k: Object
};
cO.k = Promise;
const {
  race: viaOptionalHost
} = cO?.k;
export { viaOptionalHost };
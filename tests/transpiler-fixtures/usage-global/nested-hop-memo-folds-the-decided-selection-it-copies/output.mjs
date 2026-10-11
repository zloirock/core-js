import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.keys";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/web.dom-collections.keys";
// in usage-global nothing is rewritten, so no memo copies the selection: each leaf of the nested hop
// loads its method for every family an unknown receiver may hold, and the decided selections in the key
// and in the argument load only the `Symbol` modules their tests read
let at, flat, includes, keys;
({
  a: {
    at,
    flat
  }
} = box[typeof Symbol != 'undefined' ? 'a' : 'b']);
({
  c: {
    includes,
    keys
  }
} = make(typeof Symbol != 'undefined' && 1));
export { at, flat, includes, keys };
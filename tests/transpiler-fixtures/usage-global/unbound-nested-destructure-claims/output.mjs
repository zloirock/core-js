import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// An unbound receiver is evaluated once before its nested method reads. Refusing to
// replay that receiver must keep the instance extraction and its live leaf default
// available on the first transformation.
const known = [1, [2]];
let method, flat;
({
  y: {
    at: method
  },
  z: {
    flat
  }
} = {
  y: unknown,
  z: known
});
const [{
  y: {
    includes = makeFallback()
  }
}] = [box];
export { method, flat, includes };
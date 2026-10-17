import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A nested parameter pattern pairs through a pristine inline-array spread.
// Its final quiet receiver can supply a data slot without a deferred accessor.
const array = (([{
  at
}]) => at)([...[[1, 2]]]);
const string = (([{
  includes
}]) => includes)([...['ab']]);
export { array, string };
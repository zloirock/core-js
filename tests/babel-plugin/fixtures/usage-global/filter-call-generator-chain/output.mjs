import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
function* gen() {
  yield 1;
}
gen().filter(fn);
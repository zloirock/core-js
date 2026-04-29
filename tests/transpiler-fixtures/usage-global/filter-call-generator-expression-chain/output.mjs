import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.filter";
const gen = function* () {
  yield 1;
};
gen().filter(fn);
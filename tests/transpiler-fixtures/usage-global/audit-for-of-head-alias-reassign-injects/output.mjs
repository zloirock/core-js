import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the for-of head writes the alias P only when the iterable yields at least once; on the empty-array
// path P keeps its pre-loop value Promise, so the later call may dispatch on Promise. usage-global
// must still inject es.promise.all-settled - the head write does not dominate the use after the loop.
function f(arr) {
  var P = Promise;
  for (P of arr) {}
  P.allSettled([]);
}
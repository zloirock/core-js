import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the Promise alias is reassigned only inside a nested function, which may not have run by the call
// - it sits beyond the use's var-scope boundary, so it does not dominate the use. usage-global keeps
// the init live and injects es.promise.all-settled. distinct domination branch: the guard walk stops
// at the function boundary and never finds the write.
function f(other) {
  var P = Promise;
  function reset() {
    P = other;
  }
  reset();
  P.allSettled([]);
}
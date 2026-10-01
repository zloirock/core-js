import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the Promise alias is reassigned inside a CONDITIONAL-expression branch (`c ? (P = other) : 0`),
// a distinct guard shape from the logical form - it runs only on the c-truthy branch, so the init
// stays live on the c-falsy path and usage-global must inject es.promise.all-settled.
function f(c, other) {
  var P = Promise;
  c ? P = other : 0;
  P.allSettled([]);
}
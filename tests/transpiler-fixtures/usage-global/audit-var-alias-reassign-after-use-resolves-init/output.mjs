import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the reassignment of the Promise alias comes AFTER the use, so the init value is still live at the
// call - a later write can't change what the use read. usage-global resolves it and injects
// es.promise.all-settled. distinct domination branch from the conditional case: the write here is
// unconditional but simply does not textually precede the use.
function f(other) {
  var P = Promise;
  P.allSettled([]);
  P = other;
}
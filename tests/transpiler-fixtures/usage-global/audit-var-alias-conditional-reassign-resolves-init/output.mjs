import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// `var P = Promise` then a CONDITIONAL reassignment (`if (c) P = other`) leaves the Promise alias
// live on the c-falsy path. usage-global keeps the call site, so it must still inject
// es.promise.all-settled - a dropped polyfill would TypeError on that path. contrast the
// UNCONDITIONAL reassign in let-reassigned-binding-bail-out, where the init is dead and it bails.
function f(c, other) {
  var P = Promise;
  if (c) {
    P = other;
  }
  P.allSettled([]);
}
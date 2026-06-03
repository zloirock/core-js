import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
import "core-js/modules/es.promise.resolve";
import "core-js/modules/es.promise.all-settled";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// the Promise alias is reassigned inside a LOGICAL short-circuit (`c && (P = other)`), which runs
// only when c is truthy - so on the c-falsy path P is still Promise. usage-global must inject
// es.promise.all-settled (expression guards now recognised, like the `if`-guarded form). usage-pure
// bails (audit-var-alias-logical-guard-reassign-bails). contrast the dominating use-in-branch form.
function f(c, other) {
  var P = Promise;
  c && (P = other);
  P.allSettled([]);
}
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// the reassignment AND the use sit in the same `&&` right operand, the use after the reassign, so
// on every path that reaches the use P holds `other`, not Promise - the expr-guarded reassignment
// DOMINATES the use. usage-global must NOT inject es.promise.all-settled. shows that an
// expression-guarded reassignment is not unconditionally "live" - the dominance check still applies.
function f(c, other) {
  var P = Promise;
  c && (P = other, P.allSettled([]));
}
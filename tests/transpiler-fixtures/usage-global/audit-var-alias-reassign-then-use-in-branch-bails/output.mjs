import "core-js/modules/es.object.to-string";
import "core-js/modules/es.promise.constructor";
import "core-js/modules/es.promise.catch";
import "core-js/modules/es.promise.finally";
// a CONDITIONAL reassignment can still DOMINATE the use: here `P.allSettled(...)` sits inside the
// same branch as `P = other` and after it, so on every path reaching the use P holds `other`, not
// Promise. usage-global must NOT inject es.promise.all-settled (no live Promise path at the use).
// contrast audit-var-alias-conditional-reassign-resolves-init, where the use escapes the branch.
function f(c, other) {
  var P = Promise;
  if (c) {
    P = other;
    P.allSettled([]);
  }
}
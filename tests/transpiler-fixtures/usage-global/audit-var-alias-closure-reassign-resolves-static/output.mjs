import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// usage-global counterpart: `A.from` in a closure with A reassigned in the enclosing scope. a write
// beyond the use's var-scope boundary does not provably DOMINATE the use, so the init Array stays
// live on a reaching path and usage-global injects es.array.from (inject-if-maybe-needed, over-
// inject-safe). usage-pure must bail the same shape (audit-var-alias-closure-reassign-bails-static).
let A = Array;
function f() {
  return A.from([1, 2, 3]);
}
A = Object;
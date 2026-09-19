// usage-pure counterpart of the logical-guard reassignment: `c && (P = other)` can reach the use, so
// P is Promise OR other at `P.allSettled(...)` - the receiver-dropping rewrite would be wrong on the
// reassigned branch, so pure bails and only the bare `Promise` becomes `_Promise`. usage-global
// instead resolves it (audit-var-alias-logical-guard-reassign-resolves-init).
function f(c, other) {
  var P = Promise;
  c && (P = other);
  P.allSettled([]);
}

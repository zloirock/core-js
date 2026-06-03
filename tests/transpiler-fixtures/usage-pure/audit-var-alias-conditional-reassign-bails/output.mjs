import _Promise from "@core-js/pure/actual/promise/constructor";
// usage-pure counterpart of the conditional reassignment: pure would rewrite `P.allSettled(...)` to
// a receiver-less `_Promise$allSettled(...)`, wrong on the branch where P was reassigned - so it
// bails and only the bare `Promise` becomes `_Promise`. usage-global instead keeps the alias
// resolvable (audit-var-alias-conditional-reassign-resolves-init): the inject-vs-bail bias differs.
function f(c, other) {
  var P = _Promise;
  if (c) {
    P = other;
  }
  P.allSettled([]);
}
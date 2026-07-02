// usage-pure: `A.from` is read inside a closure while A is reassigned in the enclosing scope. the
// write lies textually after the closure body, but the closure can be CALLED after the write runs,
// so A may be Object at the read - pure bails (no `_Array$from`); a cross-var-scope write never
// qualifies as after. contrast usage-global (audit-var-alias-closure-reassign-resolves-static).
let A = Array;
function f() {
  return A.from([1, 2, 3]);
}
A = Object;
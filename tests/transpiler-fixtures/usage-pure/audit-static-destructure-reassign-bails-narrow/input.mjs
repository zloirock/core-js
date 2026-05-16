// pure-version of static-destructure reassignment narrowing. `let { from } = Array` is
// body-extracted to `let from = _Array$from` and the alias `from -> array/from` would be
// registered in the injector. when `from` is later reassigned, that alias is stale -- the
// downstream `from([1, 2])` produces whatever the reassigned function returns, not an
// Array. babel scope tracker loses `constantViolations` post-AST-mutation so the resolver
// can't detect reassignment at use site; the destructure-emitter captures the flag at
// registration time and the resolver's binding-walk consults
// `injector.isReassignedBinding`, bailing the alias lookup. result: generic `_at` instead
// of `_atMaybeArray` -- the conservative dispatch for a value of indeterminate type.
let { from } = Array;
function reassign() { from = (x) => x[0]; }
const arr = from([1, 2]);
arr.at(0);

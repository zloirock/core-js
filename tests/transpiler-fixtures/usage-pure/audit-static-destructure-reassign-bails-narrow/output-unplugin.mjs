import _Array$from from "@core-js/pure/actual/array/from";
import _at from "@core-js/pure/actual/instance/at";
// pure static-destructure reassignment narrowing. `let { from } = Array` body-extracts to
// `let from = _Array$from` with an alias; a later reassignment makes it stale. babel scope
// loses `constantViolations` post-AST-mutation, so the reassignment flag captured at
// registration bails the alias walk. result: generic `_at`, not Array-narrowed `_atMaybeArray`.
let from = _Array$from;
function reassign() { from = (x) => x[0]; }
const arr = from([1, 2]);
_at(arr).call(arr, 0);
import _at from "@core-js/pure/actual/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// Comments containing method-shaped text must remain intact - text-rewrite scopes
// to AST node spans, not to comment text inside the source range
// arr.at(0) here is just text in the comment
const a = _at(arr).call(arr, -1);
/* arr.at(...) inside a block comment */
const b = _findLastMaybeArray(arr).call(arr, p);
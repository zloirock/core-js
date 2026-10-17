import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the ASSIGNMENT form folds on both emitters: the binding's only write IS the aliasing
// destructure (babel folds via its in-place hint; the shared predicate carries the
// mutation-free side)
var assigned;
assigned = _Symbol$iterator;
export const viaAssignForm = _getIteratorMethod([]);
// the ASSIGNMENT form folds on both emitters: the binding's only write IS the aliasing
// destructure (babel folds via its in-place hint; the shared predicate carries the
// mutation-free side)
var assigned;
({ iterator: assigned } = Symbol);
export const viaAssignForm = [][assigned];

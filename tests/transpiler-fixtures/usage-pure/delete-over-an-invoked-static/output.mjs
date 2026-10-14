import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Object$fromEntries from "@core-js/pure/actual/object/from-entries";
// A `delete` whose operand calls a static off a realm navigation names no reference to delete: the
// call runs once on the static's own entry, after any effect the navigation's root buries, and the
// navigation folds with no guard.
let n = 0;
export const invokedClaim = delete _Array$of(5);
export const invokedClaimSeq = delete (n++, _Array$from)([6]);
export const invokedStaticSeq = delete (n++, _Object$fromEntries)([]);
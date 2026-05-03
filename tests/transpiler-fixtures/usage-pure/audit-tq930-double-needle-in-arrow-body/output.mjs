import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// two identical polyfilled call exprs `arr.flat()` in the same expression. each is a
// separate AST node so transform-queue stores two distinct transforms; equal-range
// merge only fires when the same [start, end] appears twice, which is not the case
// here. verifies the merge invariant doesn't false-trigger on legitimate repeated
// method calls at distinct source positions
const a = _flatMaybeArray(arr).call(arr) === _flatMaybeArray(arr).call(arr);
const b = _flatMaybeArray(arr).call(arr) && _flatMaybeArray(arr).call(arr) && _findLastMaybeArray(arr).call(arr, p);
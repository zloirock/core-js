import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// two identical polyfilled call exprs `arr.flat()` in the same expression. each is a
// separate AST node so the two emissions stay distinct; equal-range deduplication
// only fires when the same [start, end] appears twice (same parsed node), which is
// not the case here. verifies that legitimate repeated method calls at distinct
// source positions don't false-trigger the dedup branch
const a = _flatMaybeArray(arr).call(arr) === _flatMaybeArray(arr).call(arr);
const b = _flatMaybeArray(arr).call(arr) && _flatMaybeArray(arr).call(arr) && _findLastMaybeArray(arr).call(arr, p);
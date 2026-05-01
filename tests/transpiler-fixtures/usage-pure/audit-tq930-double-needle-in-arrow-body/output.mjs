import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// TQ-9-30 invariant probe: arrow body holds two identical polyfilled call exprs
// `arr.flat()`. Each is a SEPARATE AST node so transform-queue stores two distinct
// transforms; equal-range merge only fires when same [start, end] appears twice,
// which is not the case here. Verifies invariant doesn't false-trigger on legitimate
// repeated method calls
const a = _flatMaybeArray(arr).call(arr) === _flatMaybeArray(arr).call(arr);
const b = _flatMaybeArray(arr).call(arr) && _flatMaybeArray(arr).call(arr) && _findLastMaybeArray(arr).call(arr, p);
import _spliceMaybeArray from "@core-js/pure/actual/array/instance/splice";
// a registry METHOD read outside a call position extracts the function value - its later
// call is untrackable, so the extraction bails regardless of which method leaves
const extracted = [[1], [2]];
const m = _spliceMaybeArray(extracted);
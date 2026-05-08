import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _at from "@core-js/pure/actual/instance/at";
// Template-literal interpolation - arr.at would be inside the literal but its
// substring nearly matches needle. AST visit isolates emission to the actual call expr
const log = `result ${_at(arr).call(arr, 0)}`;
const note = `arr.at(0) is the literal text here`;
const b = _findLastMaybeArray(arr).call(arr, p);
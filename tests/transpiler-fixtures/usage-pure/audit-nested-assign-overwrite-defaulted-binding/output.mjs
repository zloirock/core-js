import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3, _ref4;
// A nested instance-method assignment writes the helper result after evaluating its RHS.
// A defaulted binding (`m = []`) is an AssignmentPattern; it still receives the method read.
// The guard evaluates its fallback only if the helper result is undefined.
declare const a: number[];
declare const b: string[];
declare const c: number[];
let m, n, o, other;
[,] = [a];
m = (_ref = _flatMaybeArray(a)) === void 0 ? [] : _ref;
[,] = [b];
// A sibling element keeps its own assignment after the method read.
n = (_ref2 = _atMaybeArray(b)) === void 0 ? 0 : _ref2;
[, _ref3] = [c, 1];
o = (_ref4 = _findLastMaybeArray(c)) === void 0 ? null : _ref4;
other = _ref3;
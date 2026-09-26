import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7;
// A nested instance-method assignment writes the helper result after capturing its receiver.
// A defaulted binding (`m = []`) is an AssignmentPattern; it still receives the method read.
// The guard evaluates its fallback only if the helper result is undefined.
declare const a: number[];
declare const b: string[];
declare const c: number[];
let m, n, o, other;
[_ref] = [a];
m = (_ref2 = _flatMaybeArray(_ref)) === void 0 ? [] : _ref2;
[_ref3] = [b];
// A sibling element keeps its own assignment after the method read.
n = (_ref4 = _atMaybeArray(_ref3)) === void 0 ? 0 : _ref4;
[_ref5, _ref6] = [c, 1];
o = (_ref7 = _findLastMaybeArray(_ref5)) === void 0 ? null : _ref7;
other = _ref6;
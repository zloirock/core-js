import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12, _ref13;
// a polyfillable GET reading off a chain that already carries a polyfillable CALL. the method-get in
// the guard test is itself a claim (`_atMaybeArray(arr)`, not a raw `arr.at`), and the tail reads off
// the memoized call result - the two channels that render this share one span, and a stand-down in
// either of them leaves the test reading the method natively.
// the three-level spellings are the shape that decides the OWNER: a GET tail combines like a call
// tail, because the standalone emit rebuilds the optional call off a memoized callee and so splits
// the middle claim's span into two disjoint slots - dropping its polyfill.
const arr = [[[1]]];
const box = {
  pick: i => arr[i]
};
export const optCallThenGet = null == (_ref = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref.call(arr, 0));
export const plainCallThenGet = _atMaybeArray(_atMaybeArray(arr).call(arr, 0));
export const optCallThenPlainTail = _atMaybeArray(arr)?.call(arr, 0).length;
export const optOptThenGet = null == (_ref2 = _atMaybeArray(arr)?.call(arr, 0)) || null == (_ref3 = _atMaybeArray(_ref2)) ? void 0 : _atMaybeArray(_ref3.call(_ref2, 0));
export const optPlainThenGet = null == (_ref4 = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_atMaybeArray(_ref5 = _ref4.call(arr, 0)).call(_ref5, 0));
export const plainOptThenGet = null == (_ref6 = _atMaybeArray(_ref7 = _atMaybeArray(arr).call(arr, 0))) ? void 0 : _atMaybeArray(_ref6.call(_ref7, 0));
// a spliced hop keeps the receiver type the chain carried: the middle read resolves the SAME
// narrowed helper it resolves without the `?.`, instead of degrading to the generic one
export const optPlainThenCall = null == (_ref8 = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref9 = _atMaybeArray(_ref10 = _ref8.call(arr, 0)).call(_ref10, 0)).call(_ref9, 0);
// NEGATIVE: a non-polyfillable call under the same tail keeps the native method-get
export const nonPolyCallThenGet = null == (_ref11 = box.pick) ? void 0 : _at(_ref11.call(box, 0));
// NEGATIVE: a call tail is the shape the combine owns, and it is unaffected
export const optCallThenCall = null == (_ref12 = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref13 = _ref12.call(arr, 0)).call(_ref13, 0);
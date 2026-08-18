import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4;
// a polyfillable GET reading off a chain that already carries a polyfillable CALL. the method-get in
// the guard test is itself a claim (`_atMaybeArray(arr)`, not a raw `arr.at`), and the tail reads off
// the memoized call result - the two channels that render this share one span, and a stand-down in
// either of them leaves the test reading the method natively.
// the three-level spellings of the same shape are a KNOWN crash of the text emitter's queue and are
// deliberately absent: locking them would pin the defect as expected output.
const arr = [[1]];
const box = {
  pick: i => arr[i]
};
export const optCallThenGet = null == (_ref = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref.call(arr, 0));
export const plainCallThenGet = _atMaybeArray(_atMaybeArray(arr).call(arr, 0));
export const optCallThenPlainTail = _atMaybeArray(arr)?.call(arr, 0).length;
// NEGATIVE: a non-polyfillable call under the same tail keeps the native method-get
export const nonPolyCallThenGet = null == (_ref2 = box.pick) ? void 0 : _at(_ref2.call(box, 0));
// NEGATIVE: a call tail is the shape the combine owns, and it is unaffected
export const optCallThenCall = null == (_ref3 = _atMaybeArray(arr)) ? void 0 : _atMaybeArray(_ref4 = _ref3.call(arr, 0)).call(_ref4, 0);
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8, _ref9, _ref10, _ref11, _ref12;
// a call-optional chain start with an ADJACENT member-optional hop folds the inner call into the
// chainStart test, so one test covers both short-circuits. a NON-polyfilled inner folds as the
// source's own optional call - one receiver read, `this` bound by position - while a polyfilled
// one keeps `.call(recv)`, its dispatcher having consumed the receiver as an argument
const arr = {
  getIt: () => [[1]],
  'a-b': () => [[2]]
};
export const safeReceiver = null == (_ref = arr.getIt?.()) ? void 0 : _atMaybeArray(_ref2 = _flatMaybeArray(_ref).call(_ref)).call(_ref2);
export const computedKey = null == (_ref3 = arr['a-b']?.()) ? void 0 : _atMaybeArray(_ref4 = _flatMaybeArray(_ref3).call(_ref3)).call(_ref4);
export const withArgs = null == (_ref5 = arr.getIt?.(1)) ? void 0 : _atMaybeArray(_ref6 = _flatMaybeArray(_ref5).call(_ref5)).call(_ref6);
const mk = () => ({
  getIt: () => [[3]]
});
export const seReceiver = null == (_ref7 = mk().getIt?.()) ? void 0 : _at(_ref8 = _flatMaybeArray(_ref7).call(_ref7)).call(_ref8);
const nested = [[[4]]];
export const polyfilledInner = null == (_ref9 = _flatMaybeArray(nested)?.call(nested)) ? void 0 : _atMaybeArray(_ref10 = _flatMaybeArray(_ref9).call(_ref9)).call(_ref10);

// NEGATIVE: no adjacent optional hop, so nothing folds and the method-get is the test
export const noAdjacentHop = null == (_ref11 = arr.getIt) ? void 0 : _atMaybeArray(_ref12 = _ref11.call(arr)).call(_ref12);
import _at from "@core-js/pure/actual/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
var _ref, _ref2, _ref3, _ref4, _ref5;
// Lock for TQ-02: identifier `_ref10` containing `_ref` substring within transform-queue
// search range. Multiple chained polyfills produce `_ref`, `_ref2`, ..., `_ref10` UID.
// nth-occurrence math must not match `_ref` inside `_ref10` when looking for the 10th
// `_ref`. Cover via 3 different chained instance methods so each emits distinct import.
const a = _at(_ref = _flatMaybeArray(arr).call(arr)).call(_ref, -1);
const b = _includes(_ref2 = _at(_ref3 = _flatMaybeArray(arr).call(arr)).call(_ref3, -1)).call(_ref2, 1);
const c = _includes(_ref4 = _at(_ref5 = _flatMaybeArray(arr).call(arr)).call(_ref5, -1)).call(_ref4, 2).toString();
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A computed-key effect runs after the destructuring receiver is evaluated and
// checked, even when wrappers hide a bare identifier. The receiver is held once so
// a key effect cannot redirect a later read by reassigning that identifier.
var _ref = arr as any,
  a = null == _ref ? _ref[""] : (k1(), _at(_ref)),
  {
    other
  } = _ref;
var _ref2 = arr2,
  f = null == _ref2 ? _ref2[""] : (k2(), _flatMaybeArray(_ref2)),
  {
    more
  } = _ref2;
// A prefix on the receiver runs once before the same ordered extraction.
var _ref3 = (se1(), arr3) as any,
  inc = null == _ref3 ? _ref3[""] : (k3(), _includes(_ref3)),
  {
    rest
  } = _ref3;
export const r = [a, f, inc, other, more, rest];
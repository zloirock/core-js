import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// A computed-key effect runs after the destructuring receiver is evaluated and
// checked, even when wrappers hide a bare identifier. The receiver is held once so
// a key effect cannot redirect a later read by reassigning that identifier.
var _ref = arr as any,
  _ref2 = _ref,
  a = null == _ref2 ? _ref2[""] : (k1(), _at(_ref2)),
  {
    other
  } = _ref;
var _ref3 = arr2,
  _ref4 = _ref3,
  f = null == _ref4 ? _ref4[""] : (k2(), _flatMaybeArray(_ref4)),
  {
    more
  } = _ref3;
// A prefix on the receiver runs once before the same ordered extraction.
var _ref5 = (se1(), arr3) as any,
  _ref6 = _ref5,
  inc = null == _ref6 ? _ref6[""] : (k3(), _includes(_ref6)),
  {
    rest
  } = _ref5;
export const r = [a, f, inc, other, more, rest];
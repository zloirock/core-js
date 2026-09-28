import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A nested pattern moved onto a keyed capture over a selection reads whatever the selection
// yielded, its falsy left included: no static is read off the bare constructor there - a plain
// one goes through the identity guard or stays native, and the effectful key stays a native read.
const {
    Array: _ref
  } = cnd && {
    Array
  },
  {
    [(_pushMaybeArray(log).call(log, 'k'), 'of')]: a
  } = _ref,
  b = _ref === Array ? _Array$from : _ref.from;
const [_ref2] = [cnd && {
    Number
  }],
  {
    Number: _ref3
  } = _ref2,
  {
    [(_pushMaybeArray(log).call(log, 'k'), 'isInteger')]: c,
    isNaN: d
  } = _ref3;
use(a, b, c, d);
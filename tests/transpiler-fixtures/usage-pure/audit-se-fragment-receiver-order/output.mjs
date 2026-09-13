import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a receiver peeled from under an SE-bearing sequence prefix must not be read ahead of the
// prefix. TOP-LEVEL init: the whole-init memo captures prefix + receiver in source order
var _ref = (se1(), arr),
  _ref2 = _ref,
  at = null == _ref2 ? _ref2[""] : (k1(), _at(_ref2)),
  {
    other
  } = _ref;
// A nested fragment captures the initializer before any key effect or claimed read.
const _ref4 = {
    y: (se2(), arr2),
    q: 1
  },
  {
    y: _ref3
  } = _ref4,
  _ref5 = _ref3,
  flat = null == _ref5 ? _ref5[""] : (k2(), _flatMaybeArray(_ref5)),
  {
    q
  } = _ref4;
const _ref6 = {
  z: (se3(), arr3),
  w: 1
};
const inc = _includes(_ref6.z);
const {
  w
} = _ref6; // assignment-overwrite reads the receiver AFTER the residual ran the prefix in place: the
// polyfill overwrite survives
let m;
({
  v: (se4(), arr4)
});
m = _flatMapMaybeArray(arr4);
export const r = [at, other, flat, q, inc, w, m];
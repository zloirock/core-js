import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a receiver peeled from under an SE-bearing sequence prefix must not be read ahead of the
// prefix. The complete top-level initializer runs before any key effect or property read.
var {} = (se1(), arr),
  at = (k1(), _at(arr)),
  {
    other
  } = arr;
// A nested fragment captures the initializer before any key effect or claimed read.
const _ref2 = {
    y: (se2(), arr2),
    q: 1
  },
  {
    y: _ref
  } = _ref2,
  flat = null == _ref ? _ref[""] : (k2(), _flatMaybeArray(_ref)),
  {
    q
  } = _ref2;
const _ref3 = {
  z: (se3(), arr3),
  w: 1
};
const inc = _includes(_ref3.z);
const {
  w
} = _ref3; // assignment-overwrite reads the receiver AFTER the residual ran the prefix in place: the
// polyfill overwrite survives
let m;
({
  v: (se4(), arr4)
});
m = _flatMapMaybeArray(arr4);
export const r = [at, other, flat, q, inc, w, m];
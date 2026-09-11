import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// a receiver peeled from under an SE-bearing sequence prefix must not be read ahead of the
// prefix. TOP-LEVEL init: the whole-init memo captures prefix + receiver in source order
var _ref = (se1(), arr),
  {
    [(k1(), 'at')]: _unused,
    other
  } = _ref,
  at = _at(_ref);
// NESTED fragment (extract would run before the residual evaluates the prefix): bail to native
const _ref2 = (se2(), arr2);
const flat = _flatMaybeArray(_ref2);
const {
  y: {
    [(k2(), 'flat')]: _unused2
  },
  q
} = {
  y: _ref2,
  q: 1
};
const _ref3 = (se3(), arr3);
const inc = _includes(_ref3);
const {
  z: {
    includes: _unused3
  },
  w
} = {
  z: _ref3,
  w: 1
};
// assignment-overwrite reads the receiver AFTER the residual ran the prefix in place: the
// polyfill overwrite survives
let m;
({
  v: (se4(), arr4)
});
m = _flatMapMaybeArray(arr4);
export const r = [at, other, flat, q, inc, w, m];
import _Array$of from "@core-js/pure/actual/array/of";
import _Math$sign from "@core-js/pure/actual/math/sign";
var _ref, _ref2;
// A static binding precedes a neighbouring native getter, including through a stored array.
// Capturing both positions preserves the getter's observation of the preceding binding.
let sign, other;
const source = {
  get other() {
    return typeof sign;
  }
};
const rows = [Math, source];
[_ref, _ref2] = rows;
const {
  sign: _unused
} = _ref;
sign = _Math$sign;
({
  other
} = _ref2);
const inspect = {
  get next() {
    return typeof of;
  }
};
const values = [Array, inspect];
const [_ref3, _ref4] = values;
const {
  of: _unused2
} = _ref3;
const of = _Array$of;
const {
  next
} = _ref4;
use(sign, other, of, next);
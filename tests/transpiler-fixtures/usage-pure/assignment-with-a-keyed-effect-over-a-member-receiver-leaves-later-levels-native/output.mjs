import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
var _ref;
// an assignment over a member receiver whose keyed level carries an effectful computed key extracts that
// level and leaves the levels after it on the native residual: `isInteger` stays native there (an accepted
// gap of the assignment host), while the same pattern declared serves both
const ns = {
  box: {
    w: Array,
    n: Number
  }
};
let from, isInteger;
_ref = ns.box, {
  w: {}
} = _ref, e(), from = _Array$from, {
  n: {
    isInteger
  }
} = _ref;
use(from, isInteger);
const _ref3 = ns.box;
const {
  w: _ref2
} = _ref3;
const declaredFrom = (e(), _Array$from);
const declaredIsInteger = _Number$isInteger;
use(declaredFrom, declaredIsInteger);
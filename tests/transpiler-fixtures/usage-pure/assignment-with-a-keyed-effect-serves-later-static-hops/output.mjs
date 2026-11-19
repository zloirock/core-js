import _Array$from from "@core-js/pure/actual/array/from";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
var _ref;
// The keyed assignment and its declaration twin each serve the later static in one pass.
// The member receiver is evaluated once, and its original keys determine the read order.
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
  n: {}
} = _ref, isInteger = _Number$isInteger;
use(from, isInteger);
const _ref2 = ns.box;
const {
  w: {}
} = _ref2;
const declaredFrom = (e(), _Array$from);
const declaredIsInteger = _Number$isInteger;
use(declaredFrom, declaredIsInteger);
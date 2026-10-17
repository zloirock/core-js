import _Array$from from "@core-js/pure/actual/array/from";
import _Array$of from "@core-js/pure/actual/array/of";
import _Number$isInteger from "@core-js/pure/actual/number/is-integer";
import _Object$groupBy from "@core-js/pure/actual/object/group-by";
var _ref, _ref4;
// a `||` / `??` selecting between a value and a container reads a static off whichever operand ran, so
// the container's constructor is a candidate of the identity guard, and an operand nothing names stays
// the guard's raw branch - in place, through a pattern and through a binding holding the selection
export const made = (_ref = (shim || {
  C: Array
}).C, _ref === Array ? _Array$from(items) : _ref.from(items));
const {
    C: _ref2
  } = opts.ctors ?? {
    C: Array
  },
  of = _ref2 === Array ? _Array$of : _ref2.of;
export { of };
const {
    C: _ref3
  } = shim || {
    C: Object
  },
  groupBy = _ref3 === Object ? _Object$groupBy : _ref3.groupBy;
export { groupBy };
const box = shim || {
  C: Number
};
export const whole = (_ref4 = box.C, _ref4 === Number ? _Number$isInteger(value) : _ref4.isInteger(value));
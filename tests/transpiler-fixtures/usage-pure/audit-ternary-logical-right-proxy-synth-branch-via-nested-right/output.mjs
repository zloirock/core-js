import _valuesMaybeArray from "@core-js/pure/actual/array/instance/values";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
var _ref;
// NESTED logicals recurse: the innermost right-operand proxy is the one synth-swapped
let f2 = Math.random() < 0.5;
let m2 = null,
  k2 = null;
let x2 = {
  Iterator: {
    from: v => v
  }
};
const {
  Iterator: {
    from: iterFrom
  }
} = f2 ? m2 || (k2 ?? {
  Iterator: {
    from: _Iterator$from
  }
}) : x2;
export const viaNestedRight = iterFrom(_valuesMaybeArray(_ref = [1, 2]).call(_ref));
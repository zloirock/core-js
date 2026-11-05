import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A literal namespace keeps its native static from read beside a defaulted residual binding.
// The independent flat call inside that default remains polyfilled.
const wrapper = {
  ns: Array
};
const {
  ns: {
    from
  },
  x = _flatMaybeArray(_ref = [2]).call(_ref)
} = wrapper;
from([3]);
x;
import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A nested computed static key runs once after receiver capture and before binding.
// Both the from leaf and the independent flat call retain their polyfills.
const {
    x: {}
  } = {
    x: Array
  },
  f = (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
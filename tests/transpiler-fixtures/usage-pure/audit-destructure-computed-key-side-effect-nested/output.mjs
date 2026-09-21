import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A nested computed static key evaluates once after its receiver is captured.
// The key precedes initialization of its source binding, and the pure method wins.
// The following instance call retains its own polyfill.
const {
  x: {
    [(effectful(), "from")]: f
  }
} = {
  x: {
    from: _Array$from
  }
};
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
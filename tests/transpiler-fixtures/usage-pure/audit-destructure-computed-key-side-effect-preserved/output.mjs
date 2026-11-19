import _Array$from from "@core-js/pure/actual/array/from";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// A computed static key off a proven constructor evaluates effectful(), then binds the always-defined
// pure Array.from value - nothing captures the receiver. The effect runs once before the following
// flat expression.
const f = (effectful(), _Array$from);
const doubled = _flatMaybeArray(_ref = [1, [2]]).call(_ref);
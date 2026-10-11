import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Promise$resolve from "@core-js/pure/actual/promise/resolve";
var _ref;
// an install in the sequence prefix of an instance call's receiver is decided on the tree as the source wrote it,
// before a render memoizes the receiver: it never runs, and the read after it takes the pure import in either leg
_atMaybeArray(_ref = [1]).call(_ref, 0);
export const ready = _Promise$resolve(1);
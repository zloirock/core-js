import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
// Array evaluation finishes before the nested object read.
const receiver = [1, [2]];
const [,] = [receiver, record("rhs")];
const at = _at((_ref = _flatMaybeArray(receiver)) === void 0 ? [] : _ref);
export { at };
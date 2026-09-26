import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// Array evaluation finishes before the nested object read.
const receiver = [1, [2]];
const [_ref] = [receiver, record("rhs")];
const at = _at((_ref2 = _flatMaybeArray(_ref)) === void 0 ? [] : _ref2);
export { at };
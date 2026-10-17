import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
var _ref;
const arrayRecv = new Array(3);
const fromNativeProto = _at((_ref = _flatMaybeArray(arrayRecv)) === void 0 ? [] : _ref);
export { fromNativeProto };
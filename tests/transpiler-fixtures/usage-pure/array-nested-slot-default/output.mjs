import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref;
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, [2]];
  }
};
const [,] = [receiver, record("rhs")];
const flat = _flatMaybeArray((_ref = receiver.y) === void 0 ? [] : _ref);
export { flat };
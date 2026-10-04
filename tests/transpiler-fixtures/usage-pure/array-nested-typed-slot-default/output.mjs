import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, 2];
  }
};
const [,] = [receiver, record("rhs")];
const at = _atMaybeArray((_ref = receiver.y) === void 0 ? [] : _ref);
export { at };
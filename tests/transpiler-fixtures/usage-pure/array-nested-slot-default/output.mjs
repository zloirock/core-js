import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
var _ref2;
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, [2]];
  }
};
const [_ref] = [receiver, record("rhs")];
const flat = _flatMaybeArray((_ref2 = _ref.y) === void 0 ? [] : _ref2);
export { flat };
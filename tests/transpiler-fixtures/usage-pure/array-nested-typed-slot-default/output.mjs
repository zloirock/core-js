import _at from "@core-js/pure/actual/instance/at";
var _ref2;
// Array evaluation finishes before the nested object read.
const receiver = {
  get y() {
    record("get");
    return [1, 2];
  }
};
const [_ref] = [receiver, record("rhs")];
const at = _at((_ref2 = _ref.y) === void 0 ? [] : _ref2);
export { at };
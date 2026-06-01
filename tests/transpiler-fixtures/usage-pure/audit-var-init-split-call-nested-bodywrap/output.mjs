import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includes from "@core-js/pure/actual/instance/includes";
// a destructure init that is a split-emitted instance call (`xs.flat(...)`) carrying a nested
// arrow body-wrap (`() => [1].at(0)`): extracting the split for the destructure expansion must
// resolve the split by its logical range and leave the body-wrap to compose, preserving `var _ref`
const includes = _includes(_flatMaybeArray(xs).call(xs, h(() => {
  var _ref;
  return _atMaybeArray(_ref = [1]).call(_ref, 0);
})));
includes("x");
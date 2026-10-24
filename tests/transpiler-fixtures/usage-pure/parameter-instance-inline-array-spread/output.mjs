import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A nested parameter pattern consumes an inline-array spread once.
// Its supplied receiver determines the instance dispatch at body entry.
const array = ((_ref, _unused = void 0) => {
  let [_ref2] = _ref;
  let at = _atMaybeArray(_ref2);
  return at;
})([...[[1, 2]]]);
const string = ((_ref3, _unused2 = void 0) => {
  let [_ref4] = _ref3;
  let includes = _includesMaybeString(_ref4);
  return includes;
})([...['ab']]);
export { array, string };
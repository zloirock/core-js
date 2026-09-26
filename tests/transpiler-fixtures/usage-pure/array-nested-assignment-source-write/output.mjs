import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// A bodyless assignment reads both nested methods from the original array element.
// Its later initializer may change the source variable before either method is used.
export function read(source, replacement) {
  var _ref;
  let values, at;
  if (source) {
    [_ref] = [source, source = replacement];
    values = _values(_ref.w);
    at = _at(_ref.y);
  }
  return [values, at];
}
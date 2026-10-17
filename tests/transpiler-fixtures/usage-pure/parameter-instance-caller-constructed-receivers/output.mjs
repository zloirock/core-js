import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Constructed caller receivers retain their own instance families.
// The String and Array reads use different shared methods so neither masks the other.
function text(_ref, _unused = void 0) {
  let at = _atMaybeString(_ref);
  return at;
}
function list(_ref2, _unused2 = void 0) {
  let includes = _includesMaybeArray(_ref2);
  return includes;
}
export const textMethod = text(new String('12'));
export const listMethod = list(new Array(1, 2));
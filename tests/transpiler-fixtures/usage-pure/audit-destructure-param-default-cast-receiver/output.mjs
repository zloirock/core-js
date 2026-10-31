import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A receiver assertion supplies the String family for an otherwise unknown value.
// Parameter defaults and IIFE arguments retain that annotation at the extraction site.
function f(_ref = x as string) {
  let at = _atMaybeString(_ref);
  return at;
}
const g = ((_ref2, _unused = void 0) => {
  let includes = _includesMaybeString(_ref2);
  return includes;
})(y as string);
export { f, g };
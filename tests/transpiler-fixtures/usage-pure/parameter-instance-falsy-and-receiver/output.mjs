import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Falsy left operands remain the selected receivers of closed callers and parameter defaults.
// Instance helpers must read those values even when the right operand has another family.
const empty = '';
function read(_ref, _unused = void 0) {
  let at = _atMaybeString(_ref);
  return at;
}
export const caller = read(empty && [1]);
export const fallback = function (_ref2 = '' && [2]) {
  let includes = _includesMaybeString(_ref2);
  return includes;
}();
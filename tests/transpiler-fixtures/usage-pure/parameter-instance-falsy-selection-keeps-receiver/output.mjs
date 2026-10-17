import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// Falsy selecting operands retain their native value before a logical fallback.
// A bound empty string used as the selected receiver still receives its string helper.
const zero = 0;
const fallback = [1];
const empty = '';
export const array = ((_ref, _unused = void 0) => {
  let at = _atMaybeArray(_ref);
  return at;
})(zero || fallback);
export const string = function (_ref2 = zero || empty) {
  let includes = _includesMaybeString(_ref2);
  return includes;
}();
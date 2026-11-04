import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _flagsMaybeRegexp from "@core-js/pure/actual/regexp/instance/flags";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Closed callers supply literal primitive receivers to their instance reads.
// Distinct methods keep Number, String and RegExp imports observable independently.
function number(_ref) {
  let toFixed = _toFixedMaybeNumber(_ref);
  return toFixed;
}
function text(_ref2) {
  let at = _atMaybeString(_ref2);
  return at;
}
function expression(_ref3) {
  let flags = _flagsMaybeRegexp(_ref3);
  return flags;
}
export const numberMethod = number(1);
export const textMethod = text(`12`);
export const regexpFlags = expression(/x/g);
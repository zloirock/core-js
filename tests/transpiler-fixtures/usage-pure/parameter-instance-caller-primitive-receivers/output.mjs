import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
import _flagsMaybeRegexp from "@core-js/pure/actual/regexp/instance/flags";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// Closed callers supply literal primitive receivers to their instance reads.
// Distinct methods keep Number, String and RegExp imports observable independently.
function number(_ref, _unused = void 0) {
  let toFixed = _toFixedMaybeNumber(_ref);
  return toFixed;
}
function text(_ref2, _unused2 = void 0) {
  let at = _atMaybeString(_ref2);
  return at;
}
function expression(_ref3, _unused3 = void 0) {
  let flags = _flagsMaybeRegexp(_ref3);
  return flags;
}
export const numberMethod = number(1);
export const textMethod = text(`12`);
export const regexpFlags = expression(/x/g);
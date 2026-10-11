import _sliceMaybeArray from "@core-js/pure/actual/array/instance/slice";
import _globalThis from "@core-js/pure/actual/global-this";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref, _ref2, _ref3;
// A call yields only what a return this build runs hands back: a return in an arm the build never
// takes returns nothing, and one after an `if` whose arm the build always takes and which always
// leaves never runs. An undecided test keeps every return.
function live(source) {
  if (typeof _Promise != 'undefined') return 'abc';
  return source;
}
function dead() {
  if (typeof _Promise == 'undefined') return [1];
  return 'abc';
}
function nested(source) {
  {
    if (typeof _Promise != 'undefined') {
      return 'abc';
    }
  }
  return source;
}
function undecided() {
  if (_globalThis.flag) return 'abc';
  return [1];
}
export const fromLive = _atMaybeString(_ref = live(input)).call(_ref, 0);
export const fromDead = _includesMaybeString(_ref2 = dead()).call(_ref2, 'b');
export const fromNested = nested(input).concat('d');
export const fromUndecided = _sliceMaybeArray(_ref3 = undecided()).call(_ref3, 1);
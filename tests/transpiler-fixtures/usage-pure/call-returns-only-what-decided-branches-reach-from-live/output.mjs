import _Promise from "@core-js/pure/actual/promise/constructor";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A call yields only what a return this build runs hands back: a return in an arm the build never
// takes returns nothing, and one after an `if` whose arm the build always takes and which always
// leaves never runs. An undecided test keeps every return.
function live(source) {
  if (typeof _Promise != 'undefined') return 'abc';
  return source;
}
export const fromLive = _atMaybeString(_ref = live(input)).call(_ref, 0);
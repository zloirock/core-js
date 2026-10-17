import _Promise from "@core-js/pure/actual/promise/constructor";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
var _ref;
function dead() {
  if (typeof _Promise == 'undefined') return [1];
  return 'abc';
}
export const fromDead = _includesMaybeString(_ref = dead()).call(_ref, 'b');
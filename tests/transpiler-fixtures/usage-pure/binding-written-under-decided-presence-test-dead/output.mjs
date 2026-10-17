import _Promise from "@core-js/pure/actual/promise/constructor";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
export function dead() {
  let value = 'abc';
  if (typeof _Promise == 'undefined') value = [1];
  return _includesMaybeString(value).call(value, 'b');
}
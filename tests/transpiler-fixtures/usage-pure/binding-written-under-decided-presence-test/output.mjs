import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
import _Promise from "@core-js/pure/actual/promise/constructor";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
import _padStartMaybeString from "@core-js/pure/actual/string/instance/pad-start";
// A binding written under a presence test this build always answers takes the type the test
// settles, braced or not: a write in the arm the build always takes is unconditional, one in the
// arm it never takes leaves the value before it. An undecided test keeps both values, and so does
// a `||` over an alias of a global the build does not know, which may hold a falsy value.
export function live() {
  let value = [1];
  if (typeof _Promise != 'undefined') value = 'abc';
  return value.slice(1);
}
export function dead() {
  let value = 'abc';
  if (typeof _Promise == 'undefined') value = [1];
  return _includesMaybeString(value).call(value, 'b');
}
export function arms() {
  let value;
  if (typeof _Promise != 'undefined') {
    value = 'abc';
  } else {
    value = [1];
  }
  return value.concat('d');
}
export function undecided() {
  let value = [1];
  if (_globalThis.flag) value = 'abc';
  return _at(value).call(value, 0);
}
const config = APP_CONFIG;
export function aliasLeft() {
  let value = [1];
  config || (value = 'abc');
  return _padStartMaybeString(value).call(value, 4);
}
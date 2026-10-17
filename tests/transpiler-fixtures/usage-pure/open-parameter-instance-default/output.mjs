import _includes from "@core-js/pure/actual/instance/includes";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// A supplied argument can override the array default, and an escaped function has unknown callers.
// The closed String caller narrows; the escaped function dispatches on its actual incoming receiver.
function f(_ref = [[1, 2]][0]) {
  let at = _atMaybeString(_ref);
  return at;
}
use(f("ab"));
function g(_ref2 = [1, 2]) {
  let includes = _includes(_ref2);
  return includes;
}
use(g);
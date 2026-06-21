import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// SpreadElement at a non-rest positional slot: `fn<T>(t: T)` called as `fn(...arr)`
// fills `t` with one element of arr, so T should bind to the iterable's element type.
// the spread node must be unwrapped and projected, else T stays unbound and falls back
// to `default ?? constraint`. with it, T = string, fn() returns string, and `.at(0)`
// dispatches the string-specific polyfill. mirrors the rest-param spread handling.
function fn<T>(t: T): T {
  return t;
}
declare const arr: string[];
_atMaybeString(_ref = fn(...arr)).call(_ref, 0);
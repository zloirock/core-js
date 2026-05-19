import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// SpreadElement at a non-rest positional slot. `fn<T>(t: T)` called as `fn(...arr)`
// fills the `t` position with one element of arr; T should bind to the iterable's
// element type. previously `resolveNodeType(SpreadElement)` returned null (the
// spread node isn't in the expression dispatch), T stayed unbound, and phase 2
// fell back to `default ?? constraint` (here unspecified, leaving T as a bare
// reference). with the unwrap-and-project branch, T = string, fn() returns
// string, and `.at(0)` dispatches the string-specific polyfill instead of the
// generic instance helper. mirrors the rest-param spread handling
function fn<T>(t: T): T {
  return t;
}
declare const arr: string[];
_atMaybeString(_ref = fn(...arr)).call(_ref, 0);
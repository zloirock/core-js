import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// @flow
// typeof preserves explicit signature arguments, including those supplied through an alias.
function id<T>(x: T): T {
  return x;
}
type F<U> = typeof id<U>;
function read(fn: F<string>) {
  var _ref;
  return _atMaybeString(_ref = fn("abc")).call(_ref, 0);
}
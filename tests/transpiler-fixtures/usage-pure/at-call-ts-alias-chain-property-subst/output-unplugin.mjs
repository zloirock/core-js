import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Container<T> = { value: T };
type StringContainer = Container<string>;
function foo(x: StringContainer) {
var _ref;
  _atMaybeString(_ref = x.value).call(_ref, 0);
}
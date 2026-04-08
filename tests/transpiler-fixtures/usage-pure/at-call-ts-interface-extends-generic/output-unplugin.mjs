import _atMaybeString from "@core-js/pure/actual/string/instance/at";
interface Container<T> { value: T }
interface MyBox extends Container<string> {}
function foo(x: MyBox) {
var _ref;
  _atMaybeString(_ref = x.value).call(_ref, 0);
}
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
interface Leaf<U> { value: U }
interface Middle<T> extends Leaf<T> {}
interface Root extends Middle<string> {}
function foo(x: Root) {
var _ref;
  _atMaybeString(_ref = x.value).call(_ref, 0);
}
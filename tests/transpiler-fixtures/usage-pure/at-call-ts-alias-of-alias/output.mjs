import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type Inner<T> = {
  v: T;
};
type Outer<T> = Inner<T>;
function foo(x: Outer<string>) {
  var _ref;
  _atMaybeString(_ref = x.v).call(_ref, 0);
}
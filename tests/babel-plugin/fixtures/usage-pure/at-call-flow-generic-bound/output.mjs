import _atMaybeString from "@core-js/pure/actual/string/instance/at";
function foo<T: string>(x: T) {
  _atMaybeString(x).call(x, -1);
}
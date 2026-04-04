import _atMaybeString from "@core-js/pure/actual/string/instance/at";
opaque type Name = string;
function foo(x: Name) {
  _atMaybeString(x).call(x, -1);
}
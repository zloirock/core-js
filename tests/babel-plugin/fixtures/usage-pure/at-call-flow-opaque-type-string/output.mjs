import _at from "@core-js/pure/actual/string/at";
opaque type Name = string;
function foo(x: Name) {
  _at(x).call(x, -1);
}
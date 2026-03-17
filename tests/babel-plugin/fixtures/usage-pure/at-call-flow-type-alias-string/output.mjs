import _atInstanceProperty from "@core-js/pure/actual/instance/at";
type Name = string;
function foo(x: Name) {
  _atInstanceProperty(x).call(x, -1);
}
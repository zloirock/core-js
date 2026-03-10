import _atInstanceProperty from "@core-js/pure/actual/instance/at";
function foo(x: number[]) {
  var _ref;
  _atInstanceProperty(_ref = x!).call(_ref, -1);
}
import _toFixed from "@core-js/pure/actual/instance/to-fixed";
function f(x: number) {
  _toFixed(x).call(x, 2);
}
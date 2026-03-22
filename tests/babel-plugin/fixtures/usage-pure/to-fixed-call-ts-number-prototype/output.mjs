import _toFixedMaybeNumber from "@core-js/pure/actual/number/instance/to-fixed";
function f(x: number) {
  _toFixedMaybeNumber(x).call(x, 2);
}
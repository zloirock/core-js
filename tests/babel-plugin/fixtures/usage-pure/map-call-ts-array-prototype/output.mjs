import _map from "@core-js/pure/actual/instance/map";
function f(x: number[]) {
  _map(x).call(x, String);
}
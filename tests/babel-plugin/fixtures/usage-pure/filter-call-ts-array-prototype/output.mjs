import _filter from "@core-js/pure/actual/instance/filter";
function f(x: number[]) {
  _filter(x).call(x, Boolean);
}
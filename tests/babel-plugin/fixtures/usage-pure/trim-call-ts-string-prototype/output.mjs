import _trim from "@core-js/pure/actual/instance/trim";
function f(x: string) {
  _trim(x).call(x);
}
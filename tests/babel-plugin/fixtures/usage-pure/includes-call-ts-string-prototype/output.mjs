import _includes from "@core-js/pure/actual/string/includes";
function f(x: string) {
  _includes(x).call(x, "a");
}
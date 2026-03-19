import _forEach from "@core-js/pure/actual/instance/for-each";
function f(r: RegExp) {
  _forEach(r).call(r, fn);
}
import _forEach from "@core-js/pure/actual/instance/for-each";
function f(col: HTMLCollection) {
  _forEach(col).call(col, el => console.log(el));
}
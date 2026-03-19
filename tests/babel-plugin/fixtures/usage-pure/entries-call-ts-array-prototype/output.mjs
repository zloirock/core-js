import _entries from "@core-js/pure/actual/array/entries";
function f(x: string[]) {
  _entries(x).call(x);
}
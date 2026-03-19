import _at from "@core-js/pure/actual/array/at";
function f(x: string[] | undefined) {
  x == null ? void 0 : _at(x).call(x, -1);
}
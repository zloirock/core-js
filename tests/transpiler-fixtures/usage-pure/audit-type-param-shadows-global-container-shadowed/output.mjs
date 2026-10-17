import _at from "@core-js/pure/actual/instance/at";
function shadowed<Array>(x: Array) {
  return _at(x).call(x, 0);
}
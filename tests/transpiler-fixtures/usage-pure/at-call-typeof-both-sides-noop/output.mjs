import _at from "@core-js/pure/actual/instance/at";
function f(a, b) {
  if (typeof a === typeof b) {
    return _at(a).call(a, 0);
  }
  return null;
}
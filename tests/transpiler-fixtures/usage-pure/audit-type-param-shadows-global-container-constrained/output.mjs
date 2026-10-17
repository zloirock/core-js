import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
// what the parameter shadows is the GLOBAL, not itself: a constraint on a container-named
// parameter still resolves, so the array module below has to survive
function constrained<Array extends number[]>(x: Array) {
  return _flatMaybeArray(x).call(x);
}
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
import _at from "@core-js/pure/actual/instance/at";
// Bodyless loop and conditional assignments keep their RHS evaluations and method reads inside the
// controlled body. Multiple reads write in source order, so the last one wins for a shared target.
let single;
let shared;
for (const x of xs) {
  [,] = [a];
  single = _flatMaybeArray(a);
}
if (cond) {
  [,,] = [b, c];
  shared = _flatMapMaybeArray(b);
  shared = _at(c);
}
export { single, shared };
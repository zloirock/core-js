import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _at from "@core-js/pure/actual/instance/at";
// A retained nested claim shares the earlier flat claim's receiver and initializer.
// The prefix executes once, before either property read.
export function readCaptured(box, effect) {
  let at, flat;
  effect();
  box;
  at = _at(box);
  flat = _flatMaybeArray(box.M);
  return [at, flat];
}
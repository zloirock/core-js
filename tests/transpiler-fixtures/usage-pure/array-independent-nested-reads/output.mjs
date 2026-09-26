import _at from "@core-js/pure/actual/instance/at";
import _values from "@core-js/pure/actual/instance/values";
// Independent nested reads retain source order and separate repeated getters.
export function read(source, effect) {
  effect();
  const values = _values(source.w);
  const at = _at(source.y);
  return [values, at];
}
export function repeated(source) {
  const first = _at(source.w);
  const second = _at(source.w);
  return [first, second];
}
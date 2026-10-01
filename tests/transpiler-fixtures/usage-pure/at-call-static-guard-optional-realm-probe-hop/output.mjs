import _at from "@core-js/pure/actual/instance/at";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// ... and only over the namespace itself. `window` has no entry here and stays the environment probe
// a defensive `?.` genuinely tests, so a hop through it may short-circuit before the static is ever
// read: the guard keeps its three-valued stamp and the complement branch keeps the union. the plain
// hop beside it is the narrow that stamp costs
export function hopOptional(value: number[] | string) {
  if (window?.Array.isArray(value)) return null;
  return _at(value).call(value, 0);
}
export function hopPlain(value: number[] | string) {
  if (window.Array.isArray(value)) return null;
  return _includesMaybeString(value).call(value, 1);
}
import _at from "@core-js/pure/actual/instance/at";
// An absent optional method skips argument evaluation.
export function read(receiver, argument, key) {
  return _at(receiver)?.call(receiver, argument());
}
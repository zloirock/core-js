import _at from "@core-js/pure/actual/instance/at";
// A missing method rejects after evaluating the argument.
export function read(receiver, argument, key) {
  return (_at(receiver) || 0).call(receiver, argument());
}
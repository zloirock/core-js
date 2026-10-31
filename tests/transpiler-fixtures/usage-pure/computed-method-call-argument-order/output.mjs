import _at from "@core-js/pure/actual/instance/at";
// The key and method lookup precede the argument even when the method is absent.
export function read(receiver, argument, key) {
  return receiver, key(), (_at(receiver) || 0).call(receiver, argument());
}
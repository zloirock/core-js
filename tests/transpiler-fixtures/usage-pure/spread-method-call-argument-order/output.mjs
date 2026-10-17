import _at from "@core-js/pure/actual/instance/at";
// Spread arguments evaluate before a non-callable method rejects.
export function read(receiver, argument, key) {
  return (_at(receiver) || 0).call(receiver, ...argument());
}
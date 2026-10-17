// Spread arguments evaluate before a non-callable method rejects.
export function read(receiver, argument, key) {
  return receiver.at(...argument());
}

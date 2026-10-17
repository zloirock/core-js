// The key and method lookup precede the argument even when the method is absent.
export function read(receiver, argument, key) {
  return receiver[(key(), "at")](argument());
}

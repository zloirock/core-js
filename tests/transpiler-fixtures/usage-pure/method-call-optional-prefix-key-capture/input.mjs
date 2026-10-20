// An optional effect in the receiver prefix precedes the computed key.
// The stable receiver can be reused without dropping either effect.
export function read(receiver, effect, argument) {
  const stable = receiver;
  return (effect?.(), stable)[(effect(), 'at')](argument());
}

import _at from "@core-js/pure/actual/instance/at";
// An optional effect in the receiver prefix precedes the computed key.
// The stable receiver can be reused without dropping either effect.
export function read(receiver, effect, argument) {
  const stable = receiver;
  return effect?.(), stable, effect(), (_at(stable) || 0).call(stable, argument());
}
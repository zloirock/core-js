// The global leg preserves the selected call while detecting its static.
// A selected static runs arguments before rejecting a missing method.
export function read(receiver, argument) {
  const Ctor = receiver || Array;
  return Ctor.from(argument());
}

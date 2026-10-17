// The global leg preserves the selected call while detecting its static.
// A selected static keeps argument timing through its instance fallback.
export function read(receiver, argument) {
  const Ctor = receiver || Object;
  return Ctor.entries(argument());
}

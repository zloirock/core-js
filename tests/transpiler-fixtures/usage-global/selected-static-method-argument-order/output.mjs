import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.from";
import "core-js/modules/es.string.iterator";
// The global leg preserves the selected call while detecting its static.
// A selected static runs arguments before rejecting a missing method.
export function read(receiver, argument) {
  const Ctor = receiver || Array;
  return Ctor.from(argument());
}
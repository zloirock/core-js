import "core-js/modules/es.object.entries";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.entries";
import "core-js/modules/web.dom-collections.entries";
// The global leg preserves the selected call while detecting its static.
// A selected static keeps argument timing through its instance fallback.
export function read(receiver, argument) {
  const Ctor = receiver || Object;
  return Ctor.entries(argument());
}
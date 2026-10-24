import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A missing method rejects after evaluating the argument.
export function read(receiver, argument, key) {
  return receiver.at(argument());
}
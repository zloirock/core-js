import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A sealed optional lookup still evaluates arguments before a missing callee rejects.
export function read(receiver, argument, key) {
  return (receiver?.at)(argument());
}
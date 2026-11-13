import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// A literal computed key has the same instance claim as a plain key.
export function read({
  ['at']: at
}) {
  return at;
}
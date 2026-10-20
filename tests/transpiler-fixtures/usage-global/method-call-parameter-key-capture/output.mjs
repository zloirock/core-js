import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.string.at";
// The receiver is captured before its key in the parameter's evaluation frame.
// Nested argument claims stay live inside the captured invocation.
export function read(get, key, value = get()[key(), 'at']([7].includes(7))) {
  return value;
}
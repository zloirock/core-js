import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// The initializer prefix precedes the receiver read once. A default with calls on the
// same receiver stays in its own branch and must not receive that prefix.
export function read(rows, effect, fallback) {
  let method;
  ({
    at: method = (fallback(rows), fallback(rows))
  } = (effect(), rows));
  return method;
}
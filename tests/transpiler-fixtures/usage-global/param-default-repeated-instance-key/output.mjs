import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Repeated instance keys require independent getter reads, so this default stays native.
export function read({
  at,
  at: other
} = [7]) {
  return [at, other];
}
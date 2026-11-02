import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// An extracted method named like a global constructor remains the local method.
export function read(row) {
  const {
    at: Map,
    flat
  } = row;
  return [Map.call(row, -1), typeof flat];
}
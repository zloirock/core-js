import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.string.at";
// A parameter with an open caller set keeps its own method values in pure.
// An unknown argument does not justify body extraction or a leaf ponyfill default.
export function read({
  at = fallback,
  flat
}) {
  return [at, flat];
}
read(custom);
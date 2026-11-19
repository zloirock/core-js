import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// A later inert default does not prevent instance extraction.
export function read({
  includes
}, options = {
  xs: [1, -2, null]
}) {
  return [includes, options];
}
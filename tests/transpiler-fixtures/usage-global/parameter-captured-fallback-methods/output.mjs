import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
// A memoized fallback can serve multiple instance leaves with one invocation.
// Its result is captured once before the two method reads.
export function read(box) {
  function use({
    y: {
      at,
      includes
    } = fallback()
  } = {
    y: box.list
  }) {
    return [at, includes];
  }
  return use();
}
import "core-js/modules/es.symbol.constructor";
import "core-js/modules/es.symbol.description";
import "core-js/modules/es.symbol.iterator";
import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.at";
import "core-js/modules/es.array.from";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.at";
import "core-js/modules/es.string.includes";
import "core-js/modules/es.string.iterator";
import "core-js/modules/web.dom-collections.iterator";
// A property getter may replace a later element's source binding.
// Extraction still reads the value captured before destructuring started.
export function read(first, second) {
  let later = second;
  const earlier = first(() => {
    later = replacement();
  });
  const [{
    at
  }, {
    includes
  }] = [earlier, later];
  return [at, includes];
}
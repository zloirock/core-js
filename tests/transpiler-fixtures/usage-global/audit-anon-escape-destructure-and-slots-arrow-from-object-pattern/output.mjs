import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const {
    x: fromObjectPattern
  } = {
    x: {
      tags: 'xy',
      scan() {
        return this.tags.includes('x');
      }
    }
  };
  sink(fromObjectPattern);
}
take(x => x, 'k');
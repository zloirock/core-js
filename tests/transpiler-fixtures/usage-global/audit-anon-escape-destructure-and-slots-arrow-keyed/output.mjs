import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.iterator.constructor";
import "core-js/modules/es.iterator.includes";
import "core-js/modules/es.string.includes";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const keyed = {
    [dyn]: {
      words: 'ab',
      ask() {
        return this.words.includes('a');
      }
    }
  };
  sink(keyed[dyn]);
}
take(x => x, 'k');
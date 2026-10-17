import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// Passing this object through the extracted value lets external code write its fields.
// Its method must therefore dispatch for both array and string receivers.
function take(sink, dyn) {
  const chained = {
    a: {}
  };
  chained.a.b = {
    bits: [4],
    poke() {
      return this.bits.at(4);
    }
  };
  sink(chained.a.b);
}
take(x => x, 'k');
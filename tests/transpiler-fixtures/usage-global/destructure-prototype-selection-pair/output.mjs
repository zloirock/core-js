import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.push";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
// A decided realm selection evaluates its prefix once before both instance reads.
const events = [];
class Source {
  static get effect() {
    events.push('effect');
    return 0;
  }
}
const {
  Array: {
    prototype: {
      at,
      flat
    }
  }
} = (Source.effect, globalThis) ?? {};
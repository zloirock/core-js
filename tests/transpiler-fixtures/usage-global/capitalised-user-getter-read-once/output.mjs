import "core-js/modules/es.array.at";
import "core-js/modules/es.array.flat";
import "core-js/modules/es.array.includes";
import "core-js/modules/es.array.species";
import "core-js/modules/es.array.unscopables.flat";
import "core-js/modules/es.global-this";
import "core-js/modules/es.string.at";
// a USER class's capitalised static getter (`KE.A`) is no built-in surface: a nested pattern through
// it reads the getter once, where the source reads it, and its claims read the memo that value lands
// in rather than re-reading the getter to spell a surface nav; the built-in twin keeps its polyfills
class KE {
  static get A() {
    log();
    return Array;
  }
}
let m, fl;
({
  A: {
    prototype: {
      at: m,
      flat: fl
    }
  }
} = KE);
const {
  Array: {
    prototype: {
      includes: inc
    }
  }
} = globalThis;
use(m, fl, inc);
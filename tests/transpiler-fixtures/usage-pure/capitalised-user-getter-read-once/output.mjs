import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
import _at from "@core-js/pure/actual/instance/at";
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
const _ref = KE.A.prototype;
m = _at(_ref);
fl = _flatMaybeArray(_ref);
const inc = _includesMaybeArray(_globalThis.Array.prototype);
use(m, fl, inc);
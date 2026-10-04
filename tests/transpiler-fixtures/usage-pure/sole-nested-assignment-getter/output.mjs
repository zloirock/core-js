import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _toReversedMaybeArray from "@core-js/pure/actual/array/instance/to-reversed";
import _includesMaybeString from "@core-js/pure/actual/string/instance/includes";
// A sole nested instance assignment reads its class getter exactly once in the dispatch.
// Bodyless and discarded-sequence hosts preserve the same evaluation slot.
// The quiet member receiver and declaration keep their existing typed dispatches.
class Source {
  static get A() {
    read();
    return Array;
  }
  static get S() {
    read();
    return String;
  }
}
let a, b, c;
a = _atMaybeArray(Source.A.prototype);
if (run) b = _includesMaybeString(Source.S.prototype);
before();
c = _findLastMaybeArray(Source.A.prototype);
after();
const quiet = {
  A: Array
};
let d;
d = _toReversedMaybeArray(quiet.A.prototype);
const e = _findLastIndexMaybeArray(Source.A.prototype);
use(a, b, c, d, e);
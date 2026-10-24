import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _flatMaybeArray from "@core-js/pure/actual/array/instance/flat";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
import _globalThis from "@core-js/pure/actual/global-this";
// A user class getter is evaluated once where a nested pattern reads its constructor prototype.
// Its proven array prototype selects the array helpers. The built-in sibling keeps its own claims.
class KE {
  static get A() {
    log();
    return Array;
  }
}
let m, fl;
const _ref = KE.A.prototype;
m = _atMaybeArray(_ref);
fl = _flatMaybeArray(_ref);
const inc = _includesMaybeArray(_globalThis.Array.prototype);
use(m, fl, inc);
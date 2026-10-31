import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$allSettled from "@core-js/pure/actual/promise/all-settled";
// A getter hop read by an instance member and then a static member is memoized once before
// either read in a const declarator.
class KE {
  static get P() {
    log();
    return _Promise;
  }
}
const nm8 = _nameMaybeFunction({
    M: KE.P
  }.M),
  s8 = _Promise$allSettled;
use(nm8, s8);
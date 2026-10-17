import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$any from "@core-js/pure/actual/promise/any";
// A getter hop read by an instance member and then a static member is memoized once before
// either read in a let declarator.
class KE {
  static get P() {
    log();
    return _Promise;
  }
}
let nm9 = _nameMaybeFunction({
    M: KE.P
  }.M),
  s9 = _Promise$any;
use(nm9, s9);
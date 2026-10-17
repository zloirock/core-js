import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Promise from "@core-js/pure/actual/promise";
import _Promise$try from "@core-js/pure/actual/promise/try";
// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// in a bodyless if slot.
class KE {
  static get P() {
    log();
    return _Promise;
  }
}
if (c) var _ref = KE.P,
  s2 = _Promise$try,
  nm2 = _nameMaybeFunction(_ref);
use(s2, nm2);
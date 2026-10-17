import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// in a declarator that has a sibling.
class KE {
  static get I() {
    log();
    return _Iterator;
  }
}
const z1 = log();
const _ref = KE.I;
const s1 = _Iterator$from,
  nm1 = _nameMaybeFunction(_ref);
use(z1, s1, nm1);
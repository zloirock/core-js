import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
// A preceding declarator finishes before the constructor-valued getter is captured.
// The from and name extractions keep that source order.
class KE {
  static get I() {
    log();
    return _Iterator;
  }
}
const z1 = log(),
  {
    M: _ref
  } = {
    M: KE.I
  },
  s1 = _Iterator$from,
  nm1 = _nameMaybeFunction(_ref);
use(z1, s1, nm1);
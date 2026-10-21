import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Getter reads and binding initialization keep their source order. Instance claims retain their own receivers.
class KE {
  static get I() {
    log();
    return _Iterator;
  }
}
const _ref = {
    A: Array,
    M: KE.I
  },
  {
    A: {
      from: a4
    }
  } = _ref,
  {
    M: _ref2
  } = _ref,
  s4 = _Iterator$zip,
  nm4 = _nameMaybeFunction(_ref2);
use(a4, s4, nm4);
import _Array$from from "@core-js/pure/actual/array/from";
import _nameMaybeFunction from "@core-js/pure/actual/function/instance/name";
import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$zip from "@core-js/pure/actual/iterator/zip";
// A getter hop read by a static and an instance member is memoized once, ahead of the static,
// beside a second hop.
class KE {
  static get I() {
    log();
    return _Iterator;
  }
}
const _ref = {
  A: {
    from: _Array$from
  },
  M: KE.I
};
const {
  A: {
    from: a4
  }
} = _ref;
const s4 = _Iterator$zip;
const nm4 = _nameMaybeFunction(_ref.M);
use(a4, s4, nm4);
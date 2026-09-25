import _Iterator from "@core-js/pure/actual/iterator";
import _Iterator$from from "@core-js/pure/actual/iterator/from";
import _Map from "@core-js/pure/actual/map";
import _Promise from "@core-js/pure/actual/promise";
// a getter whose body the single-return proof cannot settle (`try`, `switch`, `finally`) still hands
// the injecting flavor the constructors its returns spell, so a static read through it is polyfilled
// wherever it may run
class KE {
  static get I() {
    try {
      log();
    } catch {}
    return _Iterator;
  }
  static get S() {
    switch (n) {
      case 0:
        return _Promise;
      default:
        return Math;
    }
  }
}
const o = {
  get M() {
    try {
      log();
    } finally {}
    return _Map;
  }
};
const {
    M: _ref
  } = {
    M: KE.I
  },
  s1 = _ref === _Iterator ? _Iterator$from : _ref.from;
const {
  try: s2
} = KE.S;
use(s1, s2, o.M.groupBy);
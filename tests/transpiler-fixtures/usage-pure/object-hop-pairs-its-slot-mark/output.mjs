import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// A getter supplying the realm runs mark before its WeakSet leaf is bound.
// The supported constructor extraction must keep that getter effect once.
const {
    w: _ref
  } = {
    get w() {
      mark();
      return _globalThis;
    }
  },
  keptByGetterEffect = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
function mark() {}
export default [keptByGetterEffect];
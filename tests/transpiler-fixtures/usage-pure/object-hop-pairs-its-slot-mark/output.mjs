import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live.
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
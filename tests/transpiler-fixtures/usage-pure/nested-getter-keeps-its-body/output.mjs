import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// Shared capture and receiver-default routes preserve independently supported claims.
// Getter reads and binding initialization keep their source order.
const {
    w: _ref
  } = {
    get w() {
      mark();
      return _globalThis;
    }
  },
  value = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
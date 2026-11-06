import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A getter supplying a realm cannot lose its body when its constructor leaf is served.
// Its mark call runs once before the WeakSet binding initializes.
const {
    w: _ref
  } = {
    get w() {
      mark();
      return _globalThis;
    }
  },
  value = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
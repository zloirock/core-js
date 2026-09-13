import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set/constructor";
// A getter exposing its object through this keeps its returned realm for later readers.
let leaked;
const {
    w: _ref
  } = {
    get w() {
      leaked = this;
      return _globalThis;
    }
  },
  value = _ref === _globalThis ? _WeakSet : _ref.WeakSet;
inspect(leaked.w === _globalThis);
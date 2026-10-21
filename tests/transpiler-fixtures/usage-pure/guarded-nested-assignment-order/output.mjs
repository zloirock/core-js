import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakSet from "@core-js/pure/actual/weak-set";
var _ref, _ref2;
// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let SetValue = 'set-before',
  MapValue = 'map-before',
  middle,
  last;
_ref = {
  get set() {
    _pushMaybeArray(log).call(log, SetValue);
    return _globalThis;
  },
  get middle() {
    _pushMaybeArray(log).call(log, typeof SetValue, MapValue);
    return 1;
  },
  get map() {
    _pushMaybeArray(log).call(log, MapValue);
    return _globalThis;
  },
  get last() {
    _pushMaybeArray(log).call(log, typeof MapValue);
    return 2;
  }
}, {
  set: _ref2
} = _ref, SetValue = _ref2 === _globalThis ? _WeakSet : _ref2.WeakSet, {
  middle
} = _ref, {
  map: {
    WeakMap: MapValue
  }
} = _ref, {
  last
} = _ref;
export { SetValue, MapValue, middle, last, log };
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
var _ref, _ref2, _ref3;
// Both guarded getters are read in source order. Each native sibling sees the preceding write.
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
  map: _ref3
} = _ref, MapValue = _ref3 === _globalThis ? _WeakMap : _ref3.WeakMap, {
  last
} = _ref;
export { SetValue, MapValue, middle, last, log };
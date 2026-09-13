import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _WeakMap from "@core-js/pure/actual/weak-map";
import _WeakSet from "@core-js/pure/actual/weak-set";
// Separate nested constructor assignments stay between their sibling reads.
// A later getter sees the binding after the preceding guarded assignment.
// A constructor escaping through the getter includes its static methods.
const log = [];
let SetValue = 'set-before',
  MapValue = 'map-before',
  middle,
  last;
({
  set: {
    WeakSet: SetValue
  },
  middle,
  map: {
    WeakMap: MapValue
  },
  last
} = {
  get set() {
    _pushMaybeArray(log).call(log, SetValue);
    return {
      WeakSet: _WeakSet
    };
  },
  get middle() {
    _pushMaybeArray(log).call(log, typeof SetValue, MapValue);
    return 1;
  },
  get map() {
    _pushMaybeArray(log).call(log, MapValue);
    return {
      WeakMap: _WeakMap
    };
  },
  get last() {
    _pushMaybeArray(log).call(log, typeof MapValue);
    return 2;
  }
});
export { SetValue, MapValue, middle, last, log };
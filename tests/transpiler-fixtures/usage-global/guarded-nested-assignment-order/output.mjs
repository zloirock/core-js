import "core-js/modules/es.object.to-string";
import "core-js/modules/es.array.iterator";
import "core-js/modules/es.array.push";
import "core-js/modules/es.global-this";
import "core-js/modules/es.weak-map.constructor";
import "core-js/modules/es.weak-map.get-or-insert";
import "core-js/modules/es.weak-map.get-or-insert-computed";
import "core-js/modules/es.weak-set.constructor";
import "core-js/modules/web.dom-collections.iterator";
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
    log.push(SetValue);
    return globalThis;
  },
  get middle() {
    log.push(typeof SetValue, MapValue);
    return 1;
  },
  get map() {
    log.push(MapValue);
    return globalThis;
  },
  get last() {
    log.push(typeof MapValue);
    return 2;
  }
});
export { SetValue, MapValue, middle, last, log };
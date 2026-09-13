// Separate nested constructor assignments stay between their sibling reads.
// A later getter sees the binding after the preceding guarded assignment.
// A constructor escaping through the getter includes its static methods.
const log = [];
let SetValue = 'set-before', MapValue = 'map-before', middle, last;
({ set: { WeakSet: SetValue }, middle, map: { WeakMap: MapValue }, last } = {
  get set() { log.push(SetValue); return globalThis; },
  get middle() { log.push(typeof SetValue, MapValue); return 1; },
  get map() { log.push(MapValue); return globalThis; },
  get last() { log.push(typeof MapValue); return 2; },
});
export { SetValue, MapValue, middle, last, log };

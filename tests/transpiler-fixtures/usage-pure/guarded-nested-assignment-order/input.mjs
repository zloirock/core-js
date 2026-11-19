// Both guarded getters are read in source order. Each native sibling sees the preceding write.
const log = [];
let SetValue = 'set-before', MapValue = 'map-before', middle, last;
({ set: { WeakSet: SetValue }, middle, map: { WeakMap: MapValue }, last } = {
  get set() { log.push(SetValue); return globalThis; },
  get middle() { log.push(typeof SetValue, MapValue); return 1; },
  get map() { log.push(MapValue); return globalThis; },
  get last() { log.push(typeof MapValue); return 2; },
});
export { SetValue, MapValue, middle, last, log };

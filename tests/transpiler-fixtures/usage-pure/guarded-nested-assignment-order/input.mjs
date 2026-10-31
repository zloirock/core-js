// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
const log = [];
let SetValue = 'set-before', MapValue = 'map-before', middle, last;
({ set: { WeakSet: SetValue }, middle, map: { WeakMap: MapValue }, last } = {
  get set() { log.push(SetValue); return globalThis; },
  get middle() { log.push(typeof SetValue, MapValue); return 1; },
  get map() { log.push(MapValue); return globalThis; },
  get last() { log.push(typeof MapValue); return 2; },
});
export { SetValue, MapValue, middle, last, log };

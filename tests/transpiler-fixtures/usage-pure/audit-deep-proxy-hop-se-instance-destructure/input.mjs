// Instance claims retain their receiver and independent key calls through effectful realm access.
// The quiet computed control retains the existing realm collapse.
let log = [];
function eff(tag) {
  log.push(tag);
  return 'self';
}
const callInstance = globalThis[(eff('a'), 'self')].Array.prototype.flat.call([1, [2]]);
const { flatMap } = globalThis[(eff('b'), 'self')].Array.prototype;
const deepDouble = globalThis[(eff('c'), 'self')][(eff('d'), 'window')].Array.prototype.at.call([5, 6], 0);
const noSe = globalThis['self'].Array.prototype.findLast.call([7], Boolean);
export { callInstance, flatMap, deepDouble, noSe, log };

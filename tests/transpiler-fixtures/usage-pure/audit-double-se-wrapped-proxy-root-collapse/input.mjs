// A DOUBLE side effect: one in the proxy-global ROOT wrapper `(eff(), globalThis)` AND one in the proxy HOP
// key `[(eff(), 'self')]`, on an instance-method receiver. the root wrapper has no bare proxy-global identifier
// for the natural visitor to rewrite, so the receiver collapse must fold BOTH effects ahead of the pure root in
// source-eval order (wrapper first, then hop key) and drop the redundant hop: `(eff('a'), eff('b'), _globalThis)
// .Array.prototype`. uniform across an instance `.call`, a destructure binding, and a DOUBLE hop (three effects).
// multi-type methods prove the receiver-TYPE inference resolves THROUGH the double-SE collapse: `includes` / `at`
// on Array.prototype narrow to the ARRAY variant, `includes` on String.prototype to the STRING variant - an
// array-only method would resolve regardless and prove nothing. distinct import per line.
let log = [];
function eff(tag) {
  log.push(tag);
  return 0;
}
const callInstance = (eff('a'), globalThis)[(eff('b'), 'self')].Array.prototype.includes.call([1, 2], 1);
const { at } = (eff('c'), globalThis)[(eff('d'), 'self')].Array.prototype;
const doubleHop = (eff('e'), globalThis)[(eff('f'), 'self')][(eff('g'), 'window')].String.prototype.includes.call('abc', 'a');
export { callInstance, at, doubleHop, log };

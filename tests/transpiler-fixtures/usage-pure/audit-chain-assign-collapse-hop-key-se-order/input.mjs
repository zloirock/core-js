// Receiver prefixes and stored roots keep their existing static-call handling.
// Effectful realm keys retain source order: prefix, store, key, read.
let r, log = [];
function eff(t) { log.push(t); return 'self'; }
const single = (r = globalThis)[(eff('a'), 'self')].Array.of(1);
const prefix = (eff('b'), (r = globalThis)).Array.from([2]);
const both = (eff('c'), (r = globalThis))[(eff('d'), 'self')].Promise.resolve(3);
export { single, prefix, both, r, log };

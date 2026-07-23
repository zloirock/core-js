// A proxy-global HOP key carrying a buried side effect sits ABOVE a chain-assignment receiver root
// (`(r = globalThis)[(eff(), 'self')].Array.of`). usage-pure collapses the whole receiver navigation
// to the static import but must re-splice the assignment - the hop OBJECT - BEFORE the harvested
// hop-key effect: native evaluates the object before the computed key, so the assignment runs first.
// a receiver-sequence PREFIX (`(eff(), (r = globalThis)).X`) instead runs before the assignment, and
// a shape with both a prefix and a hop-key SE keeps prefix, assignment, hop-key in that order.
let r, log = [];
function eff(t) { log.push(t); return 'self'; }
const single = (r = globalThis)[(eff('a'), 'self')].Array.of(1);
const prefix = (eff('b'), (r = globalThis)).Array.from([2]);
const both = (eff('c'), (r = globalThis))[(eff('d'), 'self')].Promise.resolve(3);
export { single, prefix, both, r, log };

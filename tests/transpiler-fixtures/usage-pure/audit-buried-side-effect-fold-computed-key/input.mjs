// A side effect BURIED in a `+`-concat or template fold of a COMPUTED key (`X[(eff(), 'fr') + 'om']`,
// `` X[`fr${ (eff(), 'o') }m`] ``) must re-emit when the member collapses to a polyfill: the key folds to a
// static name and the whole member is replaced, so a fold-buried effect (unlike a top-level sequence
// prefix `[(eff(), 'from')]`, which was already preserved) was silently dropped on both emitters. covers
// static dispatch (receiver collapses), instance dispatch (key dropped, receiver memoized), template fold,
// and a receiver-HOP key on a static chain. distinct method per line so each import attributes to its line.
let log = [];
function k(name) { log.push(name); }
const staticConcat = Array[(k('a'), 'fr') + 'om']([1, 2]);
const instanceConcat = [3, 4][(k('b'), 'a') + 't'](0);
const staticTemplate = Object[`ent${ (k('c'), 'r') }ies`]({ x: 1 });
const hopConcat = globalThis[(k('d'), 'se') + 'lf'].Array.of(5);
export { staticConcat, instanceConcat, staticTemplate, hopConcat, log };

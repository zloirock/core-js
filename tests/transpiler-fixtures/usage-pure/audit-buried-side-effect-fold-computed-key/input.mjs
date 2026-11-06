// Folded static and instance keys preserve buried effects when their claims replace the member.
// An effectful realm-hop key retains the native member and its independent key claims.
let log = [];
function k(name) { log.push(name); }
const staticConcat = Array[(k('a'), 'fr') + 'om']([1, 2]);
const instanceConcat = [3, 4][(k('b'), 'a') + 't'](0);
const staticTemplate = Object[`ent${ (k('c'), 'r') }ies`]({ x: 1 });
const hopConcat = globalThis[(k('d'), 'se') + 'lf'].Array.of(5);
export { staticConcat, instanceConcat, staticTemplate, hopConcat, log };

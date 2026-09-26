// a reassigned `in` key whose reachable alternative is an INSTANCE method on the constructor:
// the union extra carries the receiver-type hint, so the prototype-only key bails instead of
// injecting the instance polyfill (`'flat' in Array` is false natively - nothing to guarantee).
// the primary static keeps its injection
let inKey = 'from';
if (globalThis.c) inKey = 'flat';
export const hit = inKey in Array;

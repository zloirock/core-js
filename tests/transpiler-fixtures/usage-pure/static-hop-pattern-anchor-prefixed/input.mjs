// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
const log = [];
const { Array: { of: { length: prefixed } } } = (log.push('e'), globalThis);
export { prefixed };
export { log };

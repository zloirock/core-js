// Object.setPrototypeOf changes the [[Prototype]] of Array, not any own slot. Array.from
// is still inherited via the prototype chain (or absent on the new proto) but the own
// slot is untouched. negative test: subsequent Array.from must be rewritten to the
// polyfill import - the mutation pre-pass must NOT recognise setPrototypeOf as own-slot
// monkey-patching the way defineProperty / deleteProperty do.
Object.setPrototypeOf(Array, Object);
Array.from([1, 2, 3]);
Array.of(4, 5);

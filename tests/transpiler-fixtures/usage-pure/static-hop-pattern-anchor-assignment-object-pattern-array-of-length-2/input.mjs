// A pattern under a static destructures its ponyfill on declaration and assignment hosts.
// Nested instance claims read that same pure value; defaults stay dead where it is defined.
// Array wrappers, aliases, proxy hops and calls preserve effects and source bindings.
const log = [];
function realm() {
  log.push('r');
  return globalThis;
}
let called;
({ Array: { of: { length: called } } } = realm());
export { called };
export { log };

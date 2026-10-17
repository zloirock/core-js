// the emitter replaces the DECLARATION of an exported destructuring, and the export statement
// around it goes with it - leaving the tracker's reference set for the names that declaration
// bound holding a path whose node is gone. the prototype-install scan walks that set for the
// object below, and reads a step it cannot classify rather than the node behind it
export const { Array: { from } } = globalThis, o = Object.create(Array.prototype);
from([1]);
export const r = o.at(0);

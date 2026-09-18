// A selection with a USER value branch refuses the inline default exactly as it refuses the mirror:
// on that branch the slot's `undefined` is the object's own answer, and the ponyfill would bind
// core-js's implementation over the value that object decides. An EFFECTFUL accessor on a key the
// pattern reads cancels the mirror - a literal cannot run it - so the leaf keeps the default the
// source wrote. A branch set the walk proves realm-only mirrors, and its slot leaves that default dead.
let reads = 0;
const host = { Object, get Array() { reads += 1; return Array; } };
const { Object: { keys: hostKeys }, Array: { from: hostFrom = null } } = globalThis.window ?? host;
const plain = { Object, Array };
const { Object: { keys: plainKeys }, Array: { from: plainFrom = null } } = globalThis.window ?? plain;
let gate = 1;
const { Array: { from: gatedFrom = null } } = gate && globalThis;
export { reads, hostKeys, hostFrom, plainKeys, plainFrom, gatedFrom };

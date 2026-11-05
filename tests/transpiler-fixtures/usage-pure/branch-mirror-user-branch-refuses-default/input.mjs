// A user branch keeps its own slot values and defaults, including accessor effects.
// Only proven realm branches may supply static polyfills through the selecting route.
let reads = 0;
const host = { Object, get Array() { reads += 1; return Array; } };
const { Object: { keys: hostKeys }, Array: { from: hostFrom = null } } = globalThis.window ?? host;
const plain = { Object, Array };
const { Object: { keys: plainKeys }, Array: { from: plainFrom = null } } = globalThis.window ?? plain;
let gate = 1;
const { Array: { from: gatedFrom = null } } = gate && globalThis;
export { reads, hostKeys, hostFrom, plainKeys, plainFrom, gatedFrom };

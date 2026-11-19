// Reading the partial assignment receiver must not rename its hoisted declaration
// to the existing lexical source binding.
const held = globalThis.window?.Array;
let from, other;
({ from, other } = held);
export { from, other };

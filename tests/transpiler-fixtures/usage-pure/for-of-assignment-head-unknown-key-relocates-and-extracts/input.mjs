// A literal-wrapper loop head keeps its native static read and computed key.
// A direct realm head relocates and extracts while retaining its loop receiver.
let from, trunc, other;
const key = pick();
for ({ w: { [key]: other, from } } of [{ w: Array }]) break;
for ({ Math: { trunc, [key]: other } } of [globalThis]) break;
export { from, trunc, other };

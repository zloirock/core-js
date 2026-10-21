// A literal-wrapper loop head keeps its native static read and computed key.
// A direct realm head still relocates and extracts; its pre-existing sidecar
// differs only in the receiver used for the residual Math read.
let from, trunc, other;
const key = pick();
for ({ w: { [key]: other, from } } of [{ w: Array }]) break;
for ({ Math: { trunc, [key]: other } } of [globalThis]) break;
export { from, trunc, other };

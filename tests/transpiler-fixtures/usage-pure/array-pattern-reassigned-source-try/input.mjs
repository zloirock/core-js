// A try block can replace the array held by an alias before a nested pattern reads it.
// A substituted namespace must retain the static that the unresolved pattern reads.
let viaTry = [Array];
try { viaTry = [Reflect]; } catch (e) { void e; }
const [{ ownKeys }] = viaTry;
export const tryWrite = ownKeys({});

// A dead optional on a proven realm root does not turn plain navigation into a host probe.
// Stored constructor reads keep the native terminal value, while their known identity makes
// the outer optional redundant. Bare, optional and proven-call roots agree.
let w, t, i, n;
export const deadRootOptional = (w = globalThis?.window.self.Array)?.from([1]);
// the `?.`-less TWIN these rows are measured against - a dead `?.` may not change one byte
export const plainTwin = (t = globalThis.window.self.Array)?.from([2]);
// ... and a call root the value canon proves carries the same dead `?.`
const dh = () => globalThis;
export const deadCallRootOptional = (i = dh()?.window.self.Array)?.from([3]);

// NEGATIVE: a store the `?.` actually TESTS is the plain swap's own shape - the guard erases and the
// write rides ahead of the binding as a comma prefix
export const keptWriteProbe = (n = globalThis)?.window.self.Array;
export { w, t, i, n };

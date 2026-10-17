// a plain property read in the same slot: its getter is user code, so it can reach the root between
// the two reads exactly as a call can
const hopBox = { n: 4 };
export const readBetweenRootReads = globalThis.window?.self.Array.of(hopBox.n, globalThis.window?.self.Math.trunc(3.5));

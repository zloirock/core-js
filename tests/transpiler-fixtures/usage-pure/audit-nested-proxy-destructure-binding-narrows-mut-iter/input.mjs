// NEGATIVE: a nested pattern under a NON-proxy key reads a user object - the leaf is not the global
const { box: { Array: BoxArray } } = globalThis;
// A written proxy slot stays raw; its nested iterator dispatch reads the replacement once.
globalThis.self = { Array: BoxArray };
const { inner: { [Symbol.iterator]: mutIter } } = self;
export { mutIter };

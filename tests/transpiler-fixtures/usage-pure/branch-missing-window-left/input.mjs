// An absent bare window keeps its ReferenceError before the member read.
// A present operand selects the realm and still needs the Promise polyfill.
export const size = (window && globalThis).Promise.length;

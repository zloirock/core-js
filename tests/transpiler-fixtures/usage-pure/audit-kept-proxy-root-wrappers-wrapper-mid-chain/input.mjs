// a cast seal MID-CHAIN ends the chain there: the read above it observes the sealed value and
// throws, so the dropped hop's `?.` may not be re-hung on the leaf that now reads off the root
let d;
export const wrapperMidChain = ((d = globalThis.window)?.self as any).Array.prototype.findLast.call([1], x => x);

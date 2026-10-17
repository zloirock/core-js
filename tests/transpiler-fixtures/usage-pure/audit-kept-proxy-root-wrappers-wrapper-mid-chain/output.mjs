import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
import _globalThis from "@core-js/pure/actual/global-this";
// a cast seal MID-CHAIN ends the chain there: the read above it observes the sealed value and
// throws, so the dropped hop's `?.` may not be re-hung on the leaf that now reads off the root
let d;
export const wrapperMidChain = _findLastMaybeArray((d = _globalThis.window).Array.prototype).call([1], x => x);
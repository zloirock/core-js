// A native array-wrapped Symbol alias identifies a later defaulted iterator read.
// The iterator token is served and the subsequent computed access uses the iterator helper.
const [{ Symbol: ArrayWrapSymbol }] = [globalThis];
const { iterator: viaArrayWrap = fb } = ArrayWrapSymbol;
export const f = [11, 12][viaArrayWrap];

// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const [{ Symbol: ArrayWrapSymbol }] = [globalThis];
const { iterator: viaArrayWrap = fb } = ArrayWrapSymbol;
export const f = [11, 12][viaArrayWrap];

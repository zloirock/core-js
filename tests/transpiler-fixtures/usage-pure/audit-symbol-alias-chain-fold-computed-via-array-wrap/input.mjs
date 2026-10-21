// Literal-container static/global leaves use the shared fallback; no wrapper synthesis is required.
// Binding identity, writes and later reads retain their existing inference and ordering.
const [{ Symbol: ArrayWrapSymbol }] = [globalThis];
const { iterator: viaArrayWrap = fb } = ArrayWrapSymbol;
export const f = [11, 12][viaArrayWrap];

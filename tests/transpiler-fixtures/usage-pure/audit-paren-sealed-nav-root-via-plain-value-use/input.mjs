// A plain read above a sealed optional value keeps the source read and its throw.
// The sealed value retains its terminal environment probe over the backed root.
export const viaPlainValueUse = (globalThis.window?.self.window).Array;

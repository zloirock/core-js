// an alias that resolves to a NON-Symbol object must never fold (wrong-value guard)
const NotSymbol = Array;
const { iterator: viaArray } = NotSymbol;
export const e = [9, 10][viaArray];

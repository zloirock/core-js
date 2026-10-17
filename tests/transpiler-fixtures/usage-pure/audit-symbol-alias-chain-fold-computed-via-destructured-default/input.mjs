// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const { self: { Symbol: DestructuredSymbol } } = globalThis;
const { iterator: viaDestructuredDefault = fb } = DestructuredSymbol;
export const c = [5, 6][viaDestructuredDefault];

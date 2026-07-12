// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = Symbol;
const { iterator: viaAlias } = AliasedSymbol;
export const a = [1, 2][viaAlias];

// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = globalThis.self.Symbol;
const { iterator: viaChain } = ChainSymbol;
export const b = [3, 4][viaChain];

// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const { self: { Symbol: DestructuredSymbol } } = globalThis;
const { iterator: viaDestructuredDefault = fb } = DestructuredSymbol;
export const c = [5, 6][viaDestructuredDefault];

// the same destructured alias with a NON-defaulted consumer stays a raw read (matching babel,
// whose hint does not propagate through the const-destructure without a default)
const { self: { Symbol: DestructuredSymbol2 } } = globalThis;
const { iterator: viaDestructuredPlain } = DestructuredSymbol2;
export const d = [7, 8][viaDestructuredPlain];

// an alias that resolves to a NON-Symbol object must never fold (wrong-value guard)
const NotSymbol = Array;
const { iterator: viaArray } = NotSymbol;
export const e = [9, 10][viaArray];

// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const [{ Symbol: ArrayWrapSymbol }] = [globalThis];
const { iterator: viaArrayWrap = fb } = ArrayWrapSymbol;
export const f = [11, 12][viaArrayWrap];

// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = Symbol;
const { iterator: viaAlias } = AliasedSymbol;
export const a = [1, 2][viaAlias];

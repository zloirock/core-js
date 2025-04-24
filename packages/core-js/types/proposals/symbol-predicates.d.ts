// proposal stage: 2
// https://github.com/tc39/proposal-symbol-predicates
interface SymbolConstructor {
  isRegisteredSymbol(value: unknown): boolean;
  isWellKnownSymbol(value: unknown): boolean;
}
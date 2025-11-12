// proposal stage: 2
// https://github.com/tc39/proposal-symbol-predicates

interface SymbolConstructor {
  /**
   * Determines whether the given value is a registered symbol.
   * @param value
   */
  isRegisteredSymbol(value: any): boolean;

  /**
   * Determines whether the given value is a well-known symbol.
   * @param value
   */
  isWellKnownSymbol(value: any): boolean;
}

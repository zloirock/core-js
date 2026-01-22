// https://github.com/tc39/proposal-symbol-predicates

interface SymbolConstructor {
  /**
   * Determines whether the given value is a registered symbol.
   * @param value - The value to check.
   */
  isRegisteredSymbol(value: any): boolean;

  /**
   * Determines whether the given value is a well-known symbol.
   * @param value - The value to check.
   */
  isWellKnownSymbol(value: any): boolean;
}

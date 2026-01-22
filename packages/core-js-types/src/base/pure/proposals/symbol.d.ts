// Motivation: We should use all unique symbols in SymbolConstructor with fallback

// proposal stage: 3
// https://github.com/tc39/proposal-explicit-resource-management

// proposal stage: 2
// https://github.com/tc39/proposal-symbol-predicates

// proposal stage: 4
// https://github.com/tc39/proposal-async-iteration

// proposal stage: 1
// https://github.com/tc39/proposal-pattern-matching

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/069de743dbd17b47cc2fc58e1d16da5410911284/src/lib/es2018.asynciterable.d.ts#L4

// proposal stage: 3
// https://github.com/tc39/proposal-decorator-metadata

// proposal stage: 4
// https://github.com/tc39/proposal-string-matchall

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2020.string.d.ts

// proposal stage: 4
// https://github.com/tc39/proposal-Symbol-description

// For ensuring compatibility with TypeScript standard types, this code is aligned with:
// https://github.com/microsoft/TypeScript/blob/f450c1b80ce6dc7b04e81899db00534018932234/src/lib/es2019.symbol.d.ts
// License: https://github.com/microsoft/TypeScript/blob/v5.9.3/LICENSE.txt

declare namespace CoreJS {
  const CoreJSDisposeSymbol: unique symbol;
  const CoreJSAsyncDisposeSymbol: unique symbol;
  const CoreJSAsyncIteratorSymbol: unique symbol;
  const CoreJSCustomMatcherSymbol: unique symbol;
  const CoreJSMetadataSymbol: unique symbol;
  const CoreJSMatchAllSymbol: unique symbol;

  type CoreJSDisposeSymbolType = typeof CoreJSDisposeSymbol;
  type CoreJSAsyncDisposeSymbolType = typeof CoreJSAsyncDisposeSymbol;
  type CoreJSAsyncIteratorSymbolType = typeof CoreJSAsyncIteratorSymbol;
  type CoreJSCustomMatcherSymbolType = typeof CoreJSCustomMatcherSymbol;
  type CoreJSMetadataSymbolType = typeof CoreJSMetadataSymbol;
  type CoreJSMatchAllSymbolType = typeof CoreJSMatchAllSymbol;

  type GetNativeWithFallback<T, K extends PropertyKey, Fallback> = K extends keyof T ? T[K] : Fallback;

  export interface CoreJSSymbolConstructor extends SymbolConstructor {
    /**
     * A method that is used to release resources held by an object. Called by the semantics of the `using` statement.
     */
    readonly dispose: GetNativeWithFallback<SymbolConstructor, 'dispose', CoreJSDisposeSymbolType>;

    /**
     * A method that is used to asynchronously release resources held by an object. Called by the semantics of the `await using` statement.
     */
    readonly asyncDispose: GetNativeWithFallback<SymbolConstructor, 'asyncDispose', CoreJSAsyncDisposeSymbolType>;

    /**
     * Determines whether the given value is a registered symbol.
     * @param value - The value to be checked.
     */
    isRegisteredSymbol(value: any): boolean;

    /**
     * Determines whether the given value is a well-known symbol.
     * @param value - The value to be checked.
     */
    isWellKnownSymbol(value: any): boolean;

    /**
     * A method that returns the default async iterator for an object. Called by the semantics of
     * the for-await-of statement.
     */
    readonly asyncIterator: GetNativeWithFallback<SymbolConstructor, 'asyncIterator', CoreJSAsyncIteratorSymbolType>;

    readonly customMatcher: GetNativeWithFallback<SymbolConstructor, 'customMatcher', CoreJSCustomMatcherSymbolType>;

    readonly metadata: GetNativeWithFallback<SymbolConstructor, 'metadata', CoreJSMetadataSymbolType>;

    readonly matchAll: GetNativeWithFallback<SymbolConstructor, 'matchAll', CoreJSMatchAllSymbolType>;
  }

  export interface CoreJSSymbol extends Symbol {
    /**
     * Expose the [[Description]] internal slot of a symbol directly.
     */
    readonly description: string | undefined;
  }

  var CoreJSSymbol: CoreJSSymbolConstructor;
}

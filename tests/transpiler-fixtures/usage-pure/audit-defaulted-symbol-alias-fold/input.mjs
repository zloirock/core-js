// a DEFAULTED well-known-symbol destructure (`const { iterator = fb } = Symbol`) is extracted into a
// plain `const iterator = _Symbol$iterator === void 0 ? fb : _Symbol$iterator` guard-ternary; the
// polyfill import is always defined, so the binding IS the symbol and a computed read off it folds
// to the iterator-method helper - the same result as the non-defaulted form
const { iterator = fallback } = Symbol;
export const viaDefault = [1, 2][iterator];

// a renamed defaulted binding folds the same way
const { iterator: renamed = other } = Symbol;
export const viaRenamedDefault = [3, 4][renamed];

// a default off a NON-Symbol object must not fold (the guarded value is not a symbol import)
const { iterator: fromMap = m } = Map;
export const viaNonSymbol = [5, 6][fromMap];

// a NESTED-pattern default reads a different key path and must stay a raw read
const { constructor: { iterator: nested = n } } = Symbol;
export const viaNested = [7][nested];

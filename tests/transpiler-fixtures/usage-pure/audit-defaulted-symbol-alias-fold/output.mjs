import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Map from "@core-js/pure/actual/map/constructor";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a DEFAULTED well-known-symbol destructure (`const { iterator = fb } = Symbol`) is extracted into a
// plain `const iterator = _Symbol$iterator === void 0 ? fb : _Symbol$iterator` guard-ternary; the
// polyfill import is always defined, so the binding IS the symbol and a computed read off it folds
// to the iterator-method helper - the same result as the non-defaulted form
const iterator = _Symbol$iterator === void 0 ? fallback : _Symbol$iterator;
export const viaDefault = _getIteratorMethod([1, 2]);

// a renamed defaulted binding folds the same way
const renamed = _Symbol$iterator === void 0 ? other : _Symbol$iterator;
export const viaRenamedDefault = _getIteratorMethod([3, 4]);

// a default off a NON-Symbol object must not fold (the guarded value is not a symbol import)
const {
  iterator: fromMap = m
} = _Map;
export const viaNonSymbol = [5, 6][fromMap];

// a NESTED-pattern default reads a different key path and must stay a raw read
const {
  constructor: {
    iterator: nested = n
  }
} = _Symbol;
export const viaNested = [7][nested];
// existing polyfill import `_SymbolIter` must be recognised as a reference to
// `Symbol.iterator`, so `_SymbolIter in foo` is treated as `Symbol.iterator in foo`
// and the is-iterable polyfill is injected
import _SymbolIter from '@core-js/pure/actual/symbol/iterator';
const v = _SymbolIter in foo;

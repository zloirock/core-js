import _isIterable from "@core-js/pure/actual/is-iterable";
// polyfill-import key: `import _SymbolIter from '@core-js/pure/.../symbol/iterator'`.
// resolveKey matches binding.importSource against SYMBOL_IMPORT_SOURCE regex, extracts 'iterator',
// converts to 'Symbol.iterator'. Then `obj[_SymbolIter] in x` resolves via branch 2 of handleBinaryIn
import _SymbolIter from '@core-js/pure/actual/symbol/iterator';
const v = _isIterable(foo);
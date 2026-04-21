import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// `resolveComputedSymbolKey` for outer `Symbol[Symbol.iterator]` emits meta with
// `key: 'Symbol.iterator'` and seeds handledObjects with INNER Symbol (via asSymbolRef's
// ref.raw/ref.unwrapped). outer Symbol is polyfilled separately: handleSymbolIterator →
// `polyfillBareGlobalReceiver` marks the outer Symbol as skipped and queues a single
// `Symbol → _Symbol` transform. without the skip, the identifier visitor would queue a
// duplicate at the same range, and the composition would produce `___Symbol` via
// nested `mergeEqualRange` wrapping the substring twice
const x = _getIteratorMethod(_Symbol);
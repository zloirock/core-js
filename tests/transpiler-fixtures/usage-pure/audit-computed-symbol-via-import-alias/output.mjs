import _isIterable from "@core-js/pure/actual/is-iterable";
// computed `in` check via const-aliased Symbol import: `const k = _SymIter; k in foo`.
// the resolver must follow the const through to its import source so the `in` check
// gets routed to the is-iterable polyfill, not left as a plain string-key lookup
import _SymIter from '@core-js/pure/actual/symbol/iterator';
const k = _SymIter;
const v = _isIterable(foo);
export { v };
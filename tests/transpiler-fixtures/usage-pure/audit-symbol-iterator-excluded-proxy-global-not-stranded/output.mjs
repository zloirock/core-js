import _getIterator from "@core-js/pure/actual/get-iterator";
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$toStringTag from "@core-js/pure/actual/symbol/to-string-tag";
// Excluding the iterator helper entries must NOT flip the emit canon: `obj[Symbol.iterator]`
// still collapses to the get-iterator-method helper (the helper wraps native lookups and stays
// correct with its polyfill modules filtered - a raw static-symbol read would diverge from the
// canonical emit and strand proxy-global receivers). a non-helper well-known symbol
// (`Symbol.toStringTag`) keeps the regular static-symbol rewrite, resolving the proxy-global
// KEY (`self.Symbol`) to the imported pure symbol. a proxy-global RECEIVER collapses to the
// pure root inside the helper call.
let obj = {};
const it = _getIteratorMethod(obj);
const tag = obj[_Symbol$toStringTag];
const strand = _getIteratorMethod(_globalThis);
// the sibling helper canons survive their entries' exclusion the same way: the zero-arg call
// shape keeps the get-iterator helper, the `in` fold keeps is-iterable
const called = _getIterator([1]);
const folded = _isIterable(obj);
export { it, tag, strand, called, folded };
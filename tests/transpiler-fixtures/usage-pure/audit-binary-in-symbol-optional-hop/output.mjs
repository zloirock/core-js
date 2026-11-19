import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol$asyncIterator from "@core-js/pure/actual/symbol/async-iterator";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a live `?.` on the LHS chain to the symbol: the rewrite would swap the LHS for an
// always-defined binding, silently flipping the membership answer where native tests the key
// `"undefined"` - so the `in` stays live text and the LHS keeps its own guarded substitution.
// chains that cannot short-circuit keep the rewrite
export const guardedIterator = (null == _globalThis.window ? void 0 : _Symbol$iterator) in [];
export const guardedAsync = (null == _globalThis.window ? void 0 : _Symbol$asyncIterator) in [];
export const guardedDeep = (null == _globalThis.window ? void 0 : _Symbol$iterator) in [];

// NEGATIVES: the rewrite fires where the chain cannot short-circuit
export const plainChain = _isIterable([]);
export const resolvableHop = _isIterable([]);
export const bareSymbol = _isIterable([]);
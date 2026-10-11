import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// reads of the well-known iterator symbol that run before the detect patching `Symbol` see the slot this
// build serves, so they keep their iterator helpers - spelled bare, off the realm, through an alias or as a
// destructured key
export const iterator = _getIterator(list);
export const iterable = _isIterable(list);
export const viaRealm = _getIterator(list);
export const realmIterable = _isIterable(list);
const S = _Symbol;
export const viaAlias = _getIterator(list);
const key = _Symbol$iterator;
export const viaKey = _getIterator(list);
_globalThis.Symbol = _Symbol;
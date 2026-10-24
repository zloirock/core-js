import _getIterator from "@core-js/pure/actual/get-iterator";
import _globalThis from "@core-js/pure/actual/global-this";
import _isIterable from "@core-js/pure/actual/is-iterable";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a Symbol install under a presence test the build decides never runs, so every well-known symbol key
// keeps its iterator helper: a member key, an `in` test, an alias, a destructured key, a class method key
if (typeof _Symbol == 'undefined') _globalThis.Symbol = SymbolShim;
export const iterator = _getIterator(list);
export const iterable = _isIterable(list);
const S = _Symbol;
export const viaAlias = _getIterator(list);
const key = _Symbol$iterator;
export const viaKey = _getIterator(list);
export class Bag {
  [_Symbol$iterator]() {
    return this;
  }
}
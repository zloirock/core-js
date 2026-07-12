import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a well-known-symbol read off a SIMPLE user alias of the constructor folds to the iterator-method
// helper: the mutation-free estree resolver follows the const-alias to Symbol just as babel does
const AliasedSymbol = _Symbol;
const viaAlias = _Symbol$iterator;
export const a = _getIteratorMethod([1, 2]);

// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = _Symbol;
const viaChain = _Symbol$iterator;
export const b = _getIteratorMethod([3, 4]);

// a DESTRUCTURED constructor alias folds through a DEFAULTED consumer (babel resolves the
// destructured chain in place when the default drives an inline)
const DestructuredSymbol = _Symbol;
const viaDestructuredDefault = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const c = _getIteratorMethod([5, 6]);

// the same destructured alias with a NON-defaulted consumer stays a raw read (matching babel,
// whose hint does not propagate through the const-destructure without a default)
const DestructuredSymbol2 = _Symbol;
const viaDestructuredPlain = _Symbol$iterator;
export const d = [7, 8][viaDestructuredPlain];

// an alias that resolves to a NON-Symbol object must never fold (wrong-value guard)
const NotSymbol = Array;
const {
  iterator: viaArray
} = NotSymbol;
export const e = [9, 10][viaArray];

// an array-wrapped destructured constructor alias (`const [{ Symbol: S }] = [globalThis]`) folds
// through the same positional peel when the consumer is defaulted
const ArrayWrapSymbol = _Symbol;
const viaArrayWrap = _Symbol$iterator === void 0 ? fb : _Symbol$iterator;
export const f = _getIteratorMethod([11, 12]);
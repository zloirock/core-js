import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// the alias may itself be a proxy-global member chain (`globalThis.self.Symbol`)
const ChainSymbol = _Symbol;
const viaChain = _Symbol$iterator;
export const b = _getIteratorMethod([3, 4]);
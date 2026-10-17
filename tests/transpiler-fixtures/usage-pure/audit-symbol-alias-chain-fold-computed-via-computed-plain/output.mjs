import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _Symbol$iterator from "@core-js/pure/actual/symbol/iterator";
// a CONSTANT-RESOLVED computed-key destructured alias (`{ [k]: S }`, key = const-bound
// string) collapses to a simple alias, whose chain-follow crosses UNCONDITIONALLY - the
// defaulted AND the plain consumer both fold
const kc = 'Symbol';
const ComputedSymbol2 = _Symbol;
const viaComputedPlain = _Symbol$iterator;
export const h = _getIteratorMethod([15, 16]);
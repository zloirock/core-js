import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// `(Symbol satisfies unknown).iterator` - TS `satisfies` wrapper must be peeled
// so the inner `Symbol.iterator` is recognised and polyfilled
const iter = _getIteratorMethod(obj);
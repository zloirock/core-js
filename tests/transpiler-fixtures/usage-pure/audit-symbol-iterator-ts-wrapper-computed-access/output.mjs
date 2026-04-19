import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// resolveComputedSymbolKey must unwrap TS wrappers in `prop.object` the same way as in handleBinaryIn
const iter = _getIteratorMethod(obj);
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
// computed Symbol-keyed property in destructure pattern. walkPatternIdentifiers walks
// only `.value` (binding name), not `.key` - Symbol.iterator reference inside key
// position is a runtime expression, not a binding. binding `iter` is what walker reports
const iter = _getIteratorMethod(obj);
iter;
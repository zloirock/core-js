import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// resolveComputedSymbolKey on a MemberExpression with nested Symbol[Symbol.X] property:
// receiver `obj[Symbol[Symbol.iterator]]`. Inner property `Symbol[Symbol.iterator]`
// resolveKey resolves to `Symbol.iterator`, and resolveComputedSymbolKey concatenates
// `Symbol.` prefix yielding malformed key `Symbol.Symbol.iterator`. The malformed key
// fails downstream entry lookup so no outer property polyfill emits, but inner
// `Symbol[Symbol.iterator]` (the nested computed-symbol-key MemberExpression) should
// still itself emit the get-iterator-method polyfill via its own visitor pass.
const v = obj[_getIteratorMethod(_Symbol)];
export { v };
import _getIteratorMethod from "@core-js/pure/actual/get-iterator-method";
import _Symbol from "@core-js/pure/actual/symbol/constructor";
// resolveComputedSymbolKey: outer MemberExpression with computed=true whose property
// is `Symbol.iterator`. Symbol[Symbol.iterator] -> `{key: 'Symbol.iterator', ref: ...}`
// meta. The raw Symbol in outer position gets marked in handledObjects; inner Symbol
// too (asSymbolRef records both raw + unwrapped)
const x = _getIteratorMethod(___Symbol);
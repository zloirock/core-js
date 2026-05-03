import _isIterable from "@core-js/pure/actual/is-iterable";
// `const k = _SymIter; obj[k]` - computed key resolves through const init to imported symbol
// module binding. resolveKey identifier branch follows VariableDeclarator init back to the
// Identifier `_SymIter`, recurses; in recursion the Identifier branch hits its `if (computed)`
// path, follows the IMPORT binding via `bindingSymbolKey` (CORE_JS_SOURCE_PREFIX matches).
// expected: receiver routed through is-iterable / iterator polyfill chain. lock: computed key
// successfully resolves to `Symbol.iterator` despite the alias hop
import _SymIter from '@core-js/pure/actual/symbol/iterator';
const k = _SymIter;
const v = _isIterable(foo);
export { v };
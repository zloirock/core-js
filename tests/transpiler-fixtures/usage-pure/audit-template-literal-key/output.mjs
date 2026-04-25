import _Symbol from "@core-js/pure/actual/symbol/constructor";
import _isIterable from "@core-js/pure/actual/is-iterable";
// computed key is a template literal that folds to `'iteriter'` - not a known well-known
// Symbol name; no symbol-keyed polyfill fires. `Symbol` receiver still gets the constructor
// polyfill on legacy targets
const a = 'iter';
_Symbol[`${a}${a}`] in obj;
// computed key is a template literal that folds to `'iterator'` - equivalent to
// `Symbol.iterator in obj`, plugin rewrites to the `isIterable` polyfill
const part1 = 'iter',
  part2 = 'ator';
_isIterable(obj);
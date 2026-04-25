// computed key is a template literal that folds to `'iteriter'` - not a known well-known
// Symbol name; no symbol-keyed polyfill fires. `Symbol` receiver still gets the constructor
// polyfill on legacy targets
const a = 'iter';
Symbol[`${a}${a}`] in obj;
// computed key is a template literal that folds to `'iterator'` - equivalent to
// `Symbol.iterator in obj`, plugin rewrites to the `isIterable` polyfill
const part1 = 'iter', part2 = 'ator';
Symbol[`${part1}${part2}`] in obj;

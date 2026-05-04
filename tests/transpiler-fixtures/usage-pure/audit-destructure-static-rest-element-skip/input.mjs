// RestElement coexists with regular static destructure: `const { from, ...rest } = Array`.
// destructure-emitter emits body-extract `const from = _Array$from;` + AST-mutates the
// destructure value to `_unused` (preserves rest semantics). receiver narrowing through
// `arr = from('hi')` finds the polyfill entry via injector's body-extract alias map -
// `staticPairFromPolyfillEntry(scope, 'from')` returns 'array/from' regardless of AST
// shape, so `arr.at` narrows to `_atMaybeArray`. babel and unplugin emit identical output
const { from, ...rest } = Array;
const arr = from('hi');
arr.at(-1);
arr.findLast(p => p);
arr.copyWithin(0, 1);

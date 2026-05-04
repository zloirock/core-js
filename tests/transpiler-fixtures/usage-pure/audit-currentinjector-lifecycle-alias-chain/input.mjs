// post-rewrite alias `const from = _Array$from` lookup goes through the per-instance
// closure that reads currentInjector lazily. typeResolvers calls staticPairFromPolyfillEntry
// which decomposes `array/from` -> (Array, from) and narrows the call return to Array.
// each chained method exercises a distinct return-type branch off the alias result:
//   - `at` (registered on Array, TypedArray, String -> generic vs array-specific differ)
//   - `flatMap` (Array-only -> verifies Array narrowing reaches non-generic registry path)
//   - `findLastIndex` (Array-only -> distinct return-type signature, not iterator-typed)
const from = Array.from;
const xs = from('hi');
const a = xs.at(0);
const b = xs.flatMap(x => [x, x]);
const c = xs.findLastIndex(x => x === 'h');
export { a, b, c };

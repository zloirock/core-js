import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastIndexMaybeArray from "@core-js/pure/actual/array/instance/find-last-index";
import _flatMapMaybeArray from "@core-js/pure/actual/array/instance/flat-map";
// post-rewrite alias `const from = _Array$from` lookup goes through the per-instance
// closure that reads currentInjector lazily. typeResolvers calls staticPairFromPolyfillEntry
// which decomposes `array/from` -> (Array, from) and narrows the call return to Array.
// each chained method exercises a distinct return-type branch off the alias result:
//   - `at` (registered on Array, TypedArray, String -> generic vs array-specific differ)
//   - `flatMap` (Array-only -> verifies Array narrowing reaches non-generic registry path)
//   - `findLastIndex` (Array-only -> distinct return-type signature, not iterator-typed)
const from = _Array$from;
const xs = from('hi');
const a = _atMaybeArray(xs).call(xs, 0);
const b = _flatMapMaybeArray(xs).call(xs, x => [x, x]);
const c = _findLastIndexMaybeArray(xs).call(xs, x => x === 'h');
export { a, b, c };
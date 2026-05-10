import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _includesMaybeArray from "@core-js/pure/actual/array/instance/includes";
// `typeof x === 'object' && x !== null` - dual-condition narrowing. classic null-strip
// pattern. plugin's foldUnionTypes already drops null at the type-resolve layer regardless
// of the runtime guard, so dispatch on `r` inside the if-body sees Array hint via fold.
// distinct methods discriminate: narrow `_atMaybeArray` / `_includesMaybeArray` if fold
// keeps Array hint; generic `_at` / `_includes` if hint lost
declare const r: number[] | null;
if (typeof r === 'object' && r !== null) {
  _atMaybeArray(r).call(r, 0);
  _includesMaybeArray(r).call(r, 1);
}
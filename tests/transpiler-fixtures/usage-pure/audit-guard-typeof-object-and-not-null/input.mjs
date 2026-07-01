// `typeof x === 'object' && x !== null` - dual-condition narrowing. classic null-strip
// pattern. the plugin's union folding already drops null at the type-resolve layer regardless
// of the runtime guard, so dispatch on `r` inside the if-body sees Array hint via fold.
// distinct methods discriminate: narrow `_atMaybeArray` / `_includesMaybeArray` if fold
// keeps Array hint; generic `_at` / `_includes` if hint lost
declare const r: number[] | null;
if (typeof r === 'object' && r !== null) {
  r.at(0);
  r.includes(1);
}

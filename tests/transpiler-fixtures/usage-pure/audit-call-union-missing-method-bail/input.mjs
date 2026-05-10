// union receiver `Array | { x: 1 }` - heterogeneous union. resolveTypeAnnotation folds
// branches via foldUnionTypes which collapses to commonType (Object) when branches lack
// a shared narrow shape. Object has no narrow polyfill hint for `.at` / `.includes`, so
// dispatch falls back to the GENERIC `_at` / `_includes` (not the array-narrow variants).
// distinct-method emit demonstrates the bail: each line drives its own generic import,
// neither narrows to `_atMaybeArray` / `_includesMaybeArray` despite Array being one branch
declare const r: number[] | { x: 1 };
r.at(0);
r.includes(1);

// heterogeneous union receiver `Array | { x: 1 }` collapses to the common Object shape, which
// has no narrow polyfill hint for `.at` / `.includes`, so dispatch falls back to the GENERIC
// `_at` / `_includes`. distinct methods show the bail: each line drives its own generic import,
// neither narrows to `_atMaybeArray` / `_includesMaybeArray` despite Array being one branch
declare const r: number[] | { x: 1 };
// @ts-expect-error a union whose other arm lacks the member is the shape under test
r.at(0);
// @ts-expect-error a union whose other arm lacks the member is the shape under test
r.includes(1);

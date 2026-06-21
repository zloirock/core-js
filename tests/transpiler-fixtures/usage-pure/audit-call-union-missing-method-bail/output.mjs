import _at from "@core-js/pure/actual/instance/at";
import _includes from "@core-js/pure/actual/instance/includes";
// heterogeneous union receiver `Array | { x: 1 }` collapses to the common Object shape, which
// has no narrow polyfill hint for `.at` / `.includes`, so dispatch falls back to the GENERIC
// `_at` / `_includes`. distinct methods show the bail: each line drives its own generic import,
// neither narrows to `_atMaybeArray` / `_includesMaybeArray` despite Array being one branch
declare const r: number[] | {
  x: 1;
};
_at(r).call(r, 0);
_includes(r).call(r, 1);
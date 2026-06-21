import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `type A = B[]; type B = A[]` - mutual recursion through Array wrappers. without a
// visited-set propagated across the TSTypeReference cross-decl re-entry, resolution
// never sees A as already-visited and burns the full depth limit before bottoming out.
// threading the visited set short-circuits the second visit of A. observable surface is
// unchanged (both land on Array<Array<unknown>>, chained narrow still picks `_atMaybeArray`),
// so this is a perf-only regression lock that mutual recursion doesn't stall the transform
type A = B[];
type B = A[];
declare const a: A;
null == (_ref = _atMaybeArray(a).call(a, 0)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
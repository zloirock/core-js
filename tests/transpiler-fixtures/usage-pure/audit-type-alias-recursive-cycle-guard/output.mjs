import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// `type A = B[]; type B = A[]` - mutual recursion through Array wrappers. without the
// seen propagation in resolveTypeAnnotation's TSTypeReference branch, the cross-decl
// re-entry never sees A in visited and the resolution burns MAX_DEPTH hops before
// bottoming out. with `seen` threaded through to resolveNamedType, the second visit
// of A short-circuits via the decl-set guard. observable surface stays the same (both
// paths land on Array<Array<unknown>>), so this is a perf-only regression lock - the
// fixture confirms mutual recursion doesn't stall the transform and chained array-narrow
// still picks `_atMaybeArray` on both hops
type A = B[];
type B = A[];
declare const a: A;
null == (_ref = _atMaybeArray(a).call(a, 0)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
// chained generic indexed access `T['a']['b']` under generic substitution: must walk
// the call-site argPath through every intermediate key. without the chained-walk fix,
// typeRefName(node.objectType) returns null on the inner TSIndexedAccessType and the
// outer resolution falls back to bare resolveTypeAnnotation losing the typeParamMap
declare function pick<T>(o: T): T['a']['b'];
const r = pick({
  a: {
    b: [1, 2, 3]
  }
});
_atMaybeArray(r).call(r, 0);
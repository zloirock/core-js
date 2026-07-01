// chained generic indexed access `T['a']['b']` under generic substitution: must walk
// the call-site argPath through every intermediate key. without the chained-walk fix,
// the type-ref name of `node.objectType` returns null on the inner TSIndexedAccessType and the
// outer resolution falls back to bare type-annotation resolution losing the type-param map
declare function pick<T>(o: T): T['a']['b'];
const r = pick({ a: { b: [1, 2, 3] } });
r.at(0);

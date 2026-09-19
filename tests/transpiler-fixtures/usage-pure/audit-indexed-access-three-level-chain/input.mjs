// three-level chained generic indexed access `T['a']['b']['c']`: walked solver
// must descend the call-site argPath through every intermediate hop before
// resolving the leaf against the object-literal property
declare function pick<T>(o: T): T['a']['b']['c'];
const r = pick({ a: { b: { c: ["x", "y", "z"] } } });
r.includes("x");

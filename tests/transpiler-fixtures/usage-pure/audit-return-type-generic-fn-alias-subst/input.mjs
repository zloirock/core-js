// ReturnType<Fn<T>> where Fn is a generic function-type alias - resolveNamedType's
// ReturnType branch follows the alias chain, accumulates subst, then peels return
// annotation. Generic arg passes through subst into the return shape (`U[]` -> `string[]`).
// Probe whether nested generic substitution into ReturnType return slot survives.
type MakeArr<U> = () => U[];
type Result = ReturnType<MakeArr<string>>;
declare const v: Result;
v.at(0);
v.findLast(x => true);

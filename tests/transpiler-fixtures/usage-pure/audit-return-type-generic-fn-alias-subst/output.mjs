import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _findLastMaybeArray from "@core-js/pure/actual/array/instance/find-last";
// ReturnType<Fn<T>> where Fn is a generic function-type alias - the named-type resolver's
// ReturnType branch follows the alias chain, accumulates substitution, then peels return
// annotation. Generic arg passes through substitution into the return shape (`U[]` -> `string[]`).
// Probe whether nested generic substitution into ReturnType return slot survives.
type MakeArr<U> = () => U[];
type Result = ReturnType<MakeArr<string>>;
declare const v: Result;
_atMaybeArray(v).call(v, 0);
_findLastMaybeArray(v).call(v, x => true);
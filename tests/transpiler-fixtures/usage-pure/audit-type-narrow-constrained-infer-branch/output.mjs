import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
// `infer U extends C` may bind U from the CONSTRAINT only when the conditional is established:
// a check side merely POSSIBLY assignable (an unmodelled structural object against a collection
// pattern) has not taken the true branch, so binding U there keys the narrow to a family the
// value may never have. `object` is not such a side - it is the TOP of the object types, which
// stands ABOVE every container and is therefore assignable to none of them, whatever the
// container. the conditional is DECIDED, so the false branch resolves precisely rather than
// folding with a true branch that has no U to bind
type FromArray<T> = T extends Array<infer U extends string> ? U : number[];
declare const viaArray: FromArray<object>;
export const falseBranch = _atMaybeArray(viaArray).call(viaArray, 0);
type FromSet<T> = T extends Set<infer U extends string> ? U : number[];
declare const viaSet: FromSet<object>;
export const falseBranchSet = _atMaybeArray(viaSet).call(viaSet, 0);
// an ESTABLISHED check side still binds the constraint: the container family matches, only the
// element is unresolved
declare const established: FromArray<Array<string>>;
export const trueBranch = _atMaybeString(established).call(established, 0);
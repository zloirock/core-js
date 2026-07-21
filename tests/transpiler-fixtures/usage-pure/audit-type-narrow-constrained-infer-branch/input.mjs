// `infer U extends C` may bind U from the CONSTRAINT only when the conditional is established:
// a check side merely POSSIBLY assignable (a structural object against a collection pattern)
// has not taken the true branch, so binding U there keys the narrow to a family the value may
// never have. an undecided conditional resolves the FALSE branch instead
type FromArray<T> = T extends Array<infer U extends string> ? U : number[];
declare const viaArray: FromArray<object>;
export const falseBranch = viaArray.at(0);
type FromSet<T> = T extends Set<infer U extends string> ? U : number[];
declare const viaSet: FromSet<object>;
export const falseBranchSet = viaSet.at(0);
// an ESTABLISHED check side still binds the constraint: the container family matches, only the
// element is unresolved
declare const established: FromArray<Array<string>>;
export const trueBranch = established.at(0);

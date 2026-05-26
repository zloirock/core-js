// `<T, U = T>(t: T): U` - default is BARE alias to inferred T. partial-infer fill
// must populate U from default(T) so `applyAliasSubstDeep(U, Map{T,U=T-ref})` resolves
// U through `T` to the inferred argument annotation
declare function makeBox<T, U = T>(t: T): U;
declare const v: string[];
const x = makeBox(v);
export const r = x.at(0);
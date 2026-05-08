// `type Q<T> = typeof identity<T>` (TS 4.7+ instantiation expression in alias body).
// resolveCallReturnTypeFromAnnotation now follows alias chain to TSTypeQuery and
// resolveReturnTypeFromTypeQuery honors instantiation typeParameters via buildSubstMap,
// so `f([...])` returns the substituted concrete shape (number[]) instead of raw U
declare function identity<U>(x: U): U;
type Q<T> = typeof identity<T>;
declare const f: Q<number[]>;
const arr = f([1, 2, 3]);
const head = arr.at(0);
export { head };

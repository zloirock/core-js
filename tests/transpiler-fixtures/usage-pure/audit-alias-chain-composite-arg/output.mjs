import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// chained generic aliases with a composite type parameter: `A<T> = B<T[]>; B<U> = U[]`.
// when resolving `A<string>`, the substitution map accumulates `{T: string, U: T[]}`; naive
// lookup leaks `T` from `U`'s value. deep alias substitution must re-recurse replacements
// so the outer chain resolves to `string[][]` and Array-specific polyfills fire on both hops
type A<T> = B<T[]>;
type B<U> = U[];
declare const x: A<string>;
null == (_ref = _atMaybeArray(x).call(x, 0)) ? void 0 : _atMaybeArray(_ref).call(_ref, 0);
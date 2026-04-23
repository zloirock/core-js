import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2, _ref3, _ref4;
// utility types (`NonNullable<T>`, `Awaited<T>`, `NoInfer<T>`, `Extract<T,U>`) referenced
// in a generic return type preserve the caller's type-param substitution - the resolver
// threads typeParamMap through resolveNamedType so `T=number[]` narrows to Array receiver
// (not generic). regressions here appear as `.at(0)` falling back to the common polyfill
declare function nonNull<T>(x: T): NonNullable<T>;
declare function awaited<T>(x: T): Awaited<T>;
declare function noInfer<T>(x: T): NoInfer<T>;
declare function extract<T>(x: T): Extract<T, number[]>;
_atMaybeArray(_ref = nonNull<number[]>([1])).call(_ref, 0);
_atMaybeArray(_ref2 = awaited<number[]>([1])).call(_ref2, 0);
_atMaybeArray(_ref3 = noInfer<number[]>([1])).call(_ref3, 0);
_atMaybeArray(_ref4 = extract<number[] | string>([1])).call(_ref4, 0);
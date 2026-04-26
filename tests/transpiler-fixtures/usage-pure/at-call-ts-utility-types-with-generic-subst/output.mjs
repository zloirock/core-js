import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref, _ref2, _ref3, _ref4;
// utility types (`NonNullable<T>`, `Awaited<T>`, `NoInfer<T>`, `Extract<T,U>`) appearing in
// a generic return position must preserve the caller's type-param substitution, so call
// expressions with `T = number[]` narrow to the array receiver and pick the array-specific
// `.at` polyfill rather than the generic instance variant.
declare function nonNull<T>(x: T): NonNullable<T>;
declare function awaited<T>(x: T): Awaited<T>;
declare function noInfer<T>(x: T): NoInfer<T>;
declare function extract<T>(x: T): Extract<T, number[]>;
_atMaybeArray(_ref = nonNull<number[]>([1])).call(_ref, 0);
_atMaybeArray(_ref2 = awaited<number[]>([1])).call(_ref2, 0);
_atMaybeArray(_ref3 = noInfer<number[]>([1])).call(_ref3, 0);
_atMaybeArray(_ref4 = extract<number[] | string>([1])).call(_ref4, 0);
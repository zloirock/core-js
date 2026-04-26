// utility types (`NonNullable<T>`, `Awaited<T>`, `NoInfer<T>`, `Extract<T,U>`) appearing in
// a generic return position must preserve the caller's type-param substitution, so call
// expressions with `T = number[]` narrow to the array receiver and pick the array-specific
// `.at` polyfill rather than the generic instance variant.
declare function nonNull<T>(x: T): NonNullable<T>;
declare function awaited<T>(x: T): Awaited<T>;
declare function noInfer<T>(x: T): NoInfer<T>;
declare function extract<T>(x: T): Extract<T, number[]>;
nonNull<number[]>([1]).at(0);
awaited<number[]>([1]).at(0);
noInfer<number[]>([1]).at(0);
extract<number[] | string>([1]).at(0);

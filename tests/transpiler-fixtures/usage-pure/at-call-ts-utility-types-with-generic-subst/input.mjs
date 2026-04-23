// utility types (`NonNullable<T>`, `Awaited<T>`, `NoInfer<T>`, `Extract<T,U>`) referenced
// in a generic return type preserve the caller's type-param substitution - the resolver
// threads typeParamMap through resolveNamedType so `T=number[]` narrows to Array receiver
// (not generic). regressions here appear as `.at(0)` falling back to the common polyfill
declare function nonNull<T>(x: T): NonNullable<T>;
declare function awaited<T>(x: T): Awaited<T>;
declare function noInfer<T>(x: T): NoInfer<T>;
declare function extract<T>(x: T): Extract<T, number[]>;
nonNull<number[]>([1]).at(0);
awaited<number[]>([1]).at(0);
noInfer<number[]>([1]).at(0);
extract<number[] | string>([1]).at(0);

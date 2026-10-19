// a tuple-index access into a self-recursive alias wrapped in a structure-preserving mapped type
// (`Readonly<R<T>>`) re-enters the element-type resolver past the alias-chain cycle guard; a depth
// budget makes it bail on the cycle, so `.includes` degrades to the generic instance polyfill
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
type R<T> = Readonly<R<T>>;
// @ts-expect-error a higher-kinded application tsc refuses is the shape under test
declare const x: R<number>[0];
x.includes(1);

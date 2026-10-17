// a tuple-index access into a self-recursive alias wrapped in a structure-preserving mapped type
// (`Readonly<R<T>>`) re-enters the element-type resolver past the alias-chain cycle guard; a depth
// budget makes it bail on the cycle, so `.includes` degrades to the generic instance polyfill
type R<T> = Readonly<R<T>>;
declare const x: R<number>[0];
x.includes(1);

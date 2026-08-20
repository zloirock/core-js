// chained generic substitution through a mapped-passthrough: `Outer<U> = Copy<U[]>`
// with `Outer<string>` should resolve to `string[]`, so `.at()` and `.includes()`
// pick the Array-specific polyfills
type Copy<T> = { [K in keyof T]: T[K] };
type Outer<U> = Copy<U[]>;
declare const arr: Outer<string>;
const first = arr.at(0);
const has = arr.includes('a');
export { first, has };

// chained generic substitution through a mapped-passthrough: `Outer<U> = Copy<U[]>`
// resolves `Outer<string>` via:  U -> string, then Copy's passthrough extracts T, T=U[]=string[].
// the deep-subst in followTypeAliasChain must propagate the param all the way through
type Copy<T> = { [K in keyof T]: T[K] };
type Outer<U> = Copy<U[]>;
declare const arr: Outer<string>;
const first = arr.at(0);
const has = arr.includes('a');
export { first, has };

// cyclic interface extends: `A extends B; B extends A`. without a visited Set in
// `getTypeMembers`'s interface branch, MAX_DEPTH bottoms out via 64-frame CPU-burn for
// every member access. visited Set short-circuits at the second visit; the lookup
// returns null so `.at` falls back to generic resolution (no array-typed polyfill)
interface A extends B { foo: number[]; }
interface B extends A { bar: string[]; }
declare const a: A;
a.foo.at(0);

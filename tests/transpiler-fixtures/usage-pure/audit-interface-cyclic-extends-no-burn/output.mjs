import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// cyclic interface extends: `A extends B; B extends A`. without a visited Set in
// `getTypeMembers`'s interface branch, MAX_DEPTH bottoms out via 64-frame CPU-burn for
// every member access. visited Set short-circuits at the second visit; the lookup
// returns null so `.at` falls back to generic resolution (no array-typed polyfill)
interface A extends B {
  foo: number[];
}
interface B extends A {
  bar: string[];
}
declare const a: A;
_atMaybeArray(_ref = a.foo).call(_ref, 0);
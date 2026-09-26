import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// a callable-typed class member whose return is a nullable UNION (`() => number[] | undefined`):
// the declared-return fold must drop the nullable arm and narrow the call result to `number[]` so
// the chained `.at` resolves to the array helper. the prior inline union fold hard-bailed on the
// `undefined` arm, degrading to the type-agnostic generic helper (the `undefined` arm throws at
// runtime regardless of the polyfill chosen, so narrowing past it is sound)
declare class C {
  make: () => number[] | undefined;
}
declare const c: C;
_atMaybeArray(_ref = c.make()).call(_ref, 0);
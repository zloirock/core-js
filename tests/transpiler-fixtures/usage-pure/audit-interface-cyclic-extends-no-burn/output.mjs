import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
// cyclic interface extends: `A extends B; B extends A`. The interface-member lookup
// must short-circuit on revisit, otherwise the cycle exhausts the recursion-depth limit
// for every member access (64 frames of CPU work per call). With cycle detection the
// lookup terminates and returns null, so `.at` falls back to generic resolution
interface A extends B {
  foo: number[];
}
interface B extends A {
  bar: string[];
}
declare const a: A;
_atMaybeArray(_ref = a.foo).call(_ref, 0);
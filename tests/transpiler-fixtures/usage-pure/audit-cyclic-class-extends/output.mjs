import _at from "@core-js/pure/actual/instance/at";
// class extends cycle `A extends B`, `B extends A`: cycle detection bails the receiver
// type to null instead of `Object`. with no known type the `.at(0)` call falls through
// to the generic instance-method polyfill (still emitted, not suppressed)
// @ts-expect-error a cyclic type tsc refuses is the shape under test
class A extends B {
  foo() {
    return _at(this).call(this, 0);
  }
}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
class B extends A {}
declare const a: A;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
_at(a).call(a, 0);
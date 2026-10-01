import _at from "@core-js/pure/actual/instance/at";
// cyclic interface extends `A extends B`, `B extends A`: cycle detection bails the
// receiver type to null. with no known type the `.at(0)` call falls through to the
// generic instance-method polyfill (still emitted, not suppressed)
interface A extends B {}
interface B extends A {}
declare const x: A;
_at(x).call(x, 0);
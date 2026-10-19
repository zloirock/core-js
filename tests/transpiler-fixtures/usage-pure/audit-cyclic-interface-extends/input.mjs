// cyclic interface extends `A extends B`, `B extends A`: cycle detection bails the
// receiver type to null. with no known type the `.at(0)` call falls through to the
// generic instance-method polyfill (still emitted, not suppressed)
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends B {}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface B extends A {}
declare const x: A;
// @ts-expect-error the member read is the probe, and the right answer is a type without it
x.at(0);

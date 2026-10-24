// mutual interface extends (A extends B, B extends A) must terminate via depth-cap
// without losing per-interface own members; both `aProp` and `bProp` resolve as Array
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends B {
  aProp: number[];
}
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface B extends A {
  bProp: string[];
}
declare const o: A;
o.aProp.at(0);
// @ts-expect-error a cyclic type tsc refuses is the shape under test
o.bProp.includes("x");

// mutual interface extends (A extends B, B extends A) must terminate via depth-cap
// without losing per-interface own members; both `aProp` and `bProp` resolve as Array
interface A extends B {
  aProp: number[];
}
interface B extends A {
  bProp: string[];
}
declare const o: A;
o.aProp.at(0);
o.bProp.includes("x");

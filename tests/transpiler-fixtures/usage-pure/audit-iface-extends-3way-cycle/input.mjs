// 3-way mutual extends cycle (A->B->C->A); cycle detection must bail before depth limit.
// Verifies the local member `aProp: number[]` is still resolvable despite the inheritance loop.
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface A extends B { aProp: number[] }
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface B extends C { bProp: number[] }
// @ts-expect-error a cyclic type tsc refuses is the shape under test
interface C extends A { cProp: number[] }
declare const x: A;
x.aProp.at(0);

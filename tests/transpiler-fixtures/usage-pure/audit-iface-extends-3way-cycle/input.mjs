// 3-way mutual extends cycle (A->B->C->A); cycle detection must bail before depth limit.
// Verifies the local member `aProp: number[]` is still resolvable despite the inheritance loop.
interface A extends B { aProp: number[] }
interface B extends C { bProp: number[] }
interface C extends A { cProp: number[] }
declare const x: A;
x.aProp.at(0);

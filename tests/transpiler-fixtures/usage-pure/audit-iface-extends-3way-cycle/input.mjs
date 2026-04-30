// 3-way mutual interface extends cycle: A extends B; B extends C; C extends A.
// collectInterfaceMembers visited Set should detect the cycle and bail.
// Without cycle detection, MAX_DEPTH=64 is the only stop. visited adds at line 1034 before recursing.
interface A extends B { aProp: number[] }
interface B extends C { bProp: number[] }
interface C extends A { cProp: number[] }
declare const x: A;
x.aProp.at(0);

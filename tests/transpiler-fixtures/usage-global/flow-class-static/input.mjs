// @flow
// An ambient static method keeps its declared string return.
declare class C { static m(): string }
C.m().at(0);

// @flow
// Ambient inheritance carries members through every hop on both surfaces.
declare class B { m(): string; static m(): number[] }
declare class M extends B {}
declare class C extends M {}
new C().m().at(0);
C.m().includes(1);

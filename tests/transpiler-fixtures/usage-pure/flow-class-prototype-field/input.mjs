// @flow
// A proto field belongs to the ancestor prototype; the nearer method owns this read.
declare class B { proto m: () => (number[] | string) }
declare class C extends B { m(): string }
new C().m().at(0);

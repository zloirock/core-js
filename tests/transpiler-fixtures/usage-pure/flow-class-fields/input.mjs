// @flow
// Instance and static fields read annotations without treating them as initializers.
declare class C { items: string; static items: number[] }
new C().items.at(0);
C.items.includes(1);

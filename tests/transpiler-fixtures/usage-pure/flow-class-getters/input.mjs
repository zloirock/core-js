// @flow
// Reading a getter returns its value; calling a getter invokes that value.
declare class C { get items(): number[]; get m(): () => string }
new C().items.at(0);
new C().m().includes("a");

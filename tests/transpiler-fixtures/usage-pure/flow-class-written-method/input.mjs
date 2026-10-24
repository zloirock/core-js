// @flow
// An observed replacement invalidates the ambient method signature.
declare class C { m(): number[] }
C.prototype.m = () => "abc";
new C().m().at(0);

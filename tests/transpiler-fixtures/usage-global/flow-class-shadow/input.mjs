// @flow
// A local value named like the ambient class does not inherit its signature.
declare class C { m(): number[] }
function f(C) { new C().m().at(0); }

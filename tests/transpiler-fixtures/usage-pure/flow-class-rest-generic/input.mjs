// @flow
// A supplied rest argument binds the generic before its array default.
declare class C { m<T = number[]>(...xs: T[]): T }
new C().m("abc").at(0);

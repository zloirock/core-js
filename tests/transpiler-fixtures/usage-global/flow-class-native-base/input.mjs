// @flow
// An ambient class can inherit a native array through another ambient class.
declare class B extends Array<string> {}
declare class C extends B {}
new C().at(0);

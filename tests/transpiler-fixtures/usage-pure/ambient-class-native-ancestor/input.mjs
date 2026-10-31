// Native instance identity survives multiple ambient ancestors.
declare class B extends Array<string> {}
declare class C extends B {}
new C().at(0);

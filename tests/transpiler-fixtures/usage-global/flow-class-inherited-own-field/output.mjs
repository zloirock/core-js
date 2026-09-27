import "core-js/modules/es.array.at";
// @flow
// Deliberately inconsistent declarations: an ancestor own field shadows the child method.
declare class B {
  m: () => number[]
}
declare class C extends B {
  m(): string
}
new C().m().at(0);
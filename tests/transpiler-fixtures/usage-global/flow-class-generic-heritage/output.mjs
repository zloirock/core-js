import "core-js/modules/es.array.at";
// @flow
// Each inherited generic argument is substituted before the next parent is read.
declare class B<T> {
  m(): T
}
declare class M<U> extends B<U> {}
declare class C extends M<number[]> {}
new C().m().at(0);
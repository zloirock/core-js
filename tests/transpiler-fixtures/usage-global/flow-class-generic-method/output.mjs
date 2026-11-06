import "core-js/modules/es.array.at";
// @flow
// A method binds its own type parameter from the call argument.
declare class C {
  m<T>(x: T): T
}
new C().m([1]).at(0);
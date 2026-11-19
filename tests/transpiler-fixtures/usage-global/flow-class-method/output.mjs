import "core-js/modules/es.array.at";
// @flow
// An ambient instance method keeps its declared array return.
declare class C {
  m(): number[]
}
new C().m().at(0);
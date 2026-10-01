import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// @flow
// An opaque supplied rest argument cannot select the generic array default.
declare class C {
  m<T = number[]>(...xs: T[]): T
}
function read(x: any) {
  return new C().m(x).at(0);
}
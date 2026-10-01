import "core-js/modules/es.array.at";
import "core-js/modules/es.string.at";
// @flow
// A callback rest parameter still mentions the generic; an opaque callback cannot select its default.
declare class C {
  m<T = number[]>(fn: (...xs: T[]) => void): T
}
function read(fn: any) {
  return new C().m(fn).at(0);
}
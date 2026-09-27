import _at from "@core-js/pure/actual/instance/at";
// @flow
// A callback rest parameter still mentions the generic; an opaque callback cannot select its default.
declare class C {
  m<T = number[]>(fn: (...xs: T[]) => void): T
}
function read(fn: any) {
  var _ref;
  return _at(_ref = new C().m(fn)).call(_ref, 0);
}
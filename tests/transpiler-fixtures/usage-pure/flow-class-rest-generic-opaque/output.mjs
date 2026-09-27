import _at from "@core-js/pure/actual/instance/at";
// @flow
// An opaque supplied rest argument cannot select the generic array default.
declare class C {
  m<T = number[]>(...xs: T[]): T
}
function read(x: any) {
  var _ref;
  return _at(_ref = new C().m(x)).call(_ref, 0);
}
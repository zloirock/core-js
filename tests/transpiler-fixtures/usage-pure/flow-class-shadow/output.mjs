import _at from "@core-js/pure/actual/instance/at";
// @flow
// A local value named like the ambient class does not inherit its signature.
declare class C {
  m(): number[]
}
function f(C) {
  var _ref;
  _at(_ref = new C().m()).call(_ref, 0);
}
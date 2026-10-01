import _at from "@core-js/pure/actual/instance/at";
var _ref;
// @flow
// An observed replacement invalidates the ambient method signature.
declare class C {
  m(): number[]
}
C.prototype.m = () => "abc";
_at(_ref = new C().m()).call(_ref, 0);
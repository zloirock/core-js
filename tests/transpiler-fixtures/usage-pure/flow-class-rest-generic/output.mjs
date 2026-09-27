import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// A supplied rest argument binds the generic before its array default.
declare class C {
  m<T = number[]>(...xs: T[]): T
}
_atMaybeString(_ref = new C().m("abc")).call(_ref, 0);
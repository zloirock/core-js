import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// A spread argument supplies the rest element type before the generic default.
declare class C {
  m<T = number[]>(...xs: T[]): T
}
_atMaybeString(_ref = new C().m(...["abc"])).call(_ref, 0);
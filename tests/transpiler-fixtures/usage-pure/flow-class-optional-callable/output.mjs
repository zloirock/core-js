import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// An absent callable field can select the string fallback; its optional marker must survive.
declare class C {
  m?: () => number[]
}
_atMaybeString(_ref = new C().m || "abc").call(_ref, 0);
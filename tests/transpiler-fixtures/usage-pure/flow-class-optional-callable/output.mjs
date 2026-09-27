import _at from "@core-js/pure/actual/instance/at";
var _ref;
// @flow
// An absent callable field can select the string fallback; its optional marker must survive.
declare class C {
  m?: () => number[]
}
_at(_ref = new C().m || "abc").call(_ref, 0);
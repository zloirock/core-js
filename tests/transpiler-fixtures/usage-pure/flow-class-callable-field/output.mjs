import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// @flow
// A function-valued ambient field exposes a signature without a runtime body.
declare class C {
  m: () => string
}
_atMaybeString(_ref = new C().m()).call(_ref, 0);
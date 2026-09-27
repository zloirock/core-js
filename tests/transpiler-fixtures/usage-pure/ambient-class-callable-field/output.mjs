import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// A declared callable field has a signature but no initializer to escape.
declare class C {
  m: () => string;
}
_atMaybeString(_ref = new C().m()).call(_ref, 0);
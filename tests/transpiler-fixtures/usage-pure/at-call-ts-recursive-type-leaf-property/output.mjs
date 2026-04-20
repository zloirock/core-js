import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type A = {
  b: A;
  label: string;
};
declare const a: A;
_atMaybeString(_ref = a.b.b.label).call(_ref, -1);
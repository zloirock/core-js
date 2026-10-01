import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
const obj = {
  value: 'hi' as string
};
declare const x: typeof obj;
_atMaybeString(_ref = x.value).call(_ref, 0);
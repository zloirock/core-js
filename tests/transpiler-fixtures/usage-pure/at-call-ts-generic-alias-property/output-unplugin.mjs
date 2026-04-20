import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type Box<T> = { value: T };
declare const b: Box<string>;
_atMaybeString(_ref = b.value).call(_ref, 0);
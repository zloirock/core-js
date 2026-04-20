import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type Box<T> = { get(): T extends number ? never : T };
declare const b: Box<string>;
_atMaybeString(_ref = b.get()).call(_ref, -1);
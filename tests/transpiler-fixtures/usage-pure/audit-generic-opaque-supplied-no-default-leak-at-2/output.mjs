import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
// An explicit string overrides an array default.
declare function makeExplicit<T = number[]>(): T;
_atMaybeString(_ref = makeExplicit<string>()).call(_ref, 0);
var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type B<U> = { get(): U };
type A = B<string>;
declare const a: A;
_atMaybeString(_ref = a.get()).call(_ref, 0);
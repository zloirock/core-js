var _ref;
import _atMaybeString from "@core-js/pure/actual/string/instance/at";
type A<T> = {
  b: {
    c: T;
  };
};
declare const a: A<string>;
_atMaybeString(_ref = a.b.c).call(_ref, -1);
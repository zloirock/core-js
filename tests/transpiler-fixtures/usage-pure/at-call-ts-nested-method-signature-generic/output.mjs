import _atMaybeString from "@core-js/pure/actual/string/instance/at";
var _ref;
type Wrapper<T> = {
  inner: {
    value(): T;
  };
};
declare const w: Wrapper<string>;
_atMaybeString(_ref = w.inner.value()).call(_ref, -1);
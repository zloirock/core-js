import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type W<T> = {
  items: T[];
};
interface I extends W<string> {}
declare const i: I;
_atMaybeArray(_ref = i.items).call(_ref, -1);
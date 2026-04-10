var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type W<T> = {
  val: T;
};
interface I extends W<string[]> {}
declare const i: I;
_atMaybeArray(_ref = i.val).call(_ref, -1);
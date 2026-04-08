var _ref;
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
type Copy<T> = { [K in keyof T]: T[K] };
declare const x: Copy<{
  items: number[];
}>;
_atMaybeArray(_ref = x.items).call(_ref, 0);
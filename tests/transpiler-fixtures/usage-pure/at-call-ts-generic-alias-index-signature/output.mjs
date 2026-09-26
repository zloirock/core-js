import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type Dict<T> = {
  [k: string]: T;
};
declare const d: Dict<number[]>;
_atMaybeArray(_ref = d.foo).call(_ref, 0);
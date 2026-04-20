import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
var _ref;
type Box<T> = { get(): T; size(): number };
declare const box: Box<string[]>;
_atMaybeArray(_ref = box.get()).call(_ref, -1);
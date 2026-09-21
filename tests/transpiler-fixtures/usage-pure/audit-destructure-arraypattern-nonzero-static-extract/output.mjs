import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// A hole-prefixed array pattern pairs its static with the correct element.
// Other elements remain intact and calls through the binding retain Array narrowing.
const [, {
  from
}] = [_Set, {
  from: _Array$from
}];
const arr = from([1, 2, 3]);
_atMaybeArray(arr).call(arr, 0);
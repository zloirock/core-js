import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _Set from "@core-js/pure/actual/set/constructor";
// A hole before a constructor keeps its exact array position.
// The static read stays native while its result narrows the later at call to an array.
const [, {
  from
}] = [_Set, Array];
const arr = from([1, 2, 3]);
_atMaybeArray(arr).call(arr, 0);
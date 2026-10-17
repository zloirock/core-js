import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
const arr = [1, 2];
const log = [];
{
  let a;
  [,] = [(_pushMaybeArray(log).call(log, 'c'), arr)];
  a = _atMaybeArray(arr);
  use(a);
}
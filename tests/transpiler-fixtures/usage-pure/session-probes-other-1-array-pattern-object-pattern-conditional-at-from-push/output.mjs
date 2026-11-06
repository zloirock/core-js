import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An instance capture in the first array element retains the supported conditional static neighbour.
// The selected from and later comparison use the same static import.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  const [, {}] = [arr, pick ? Array : userObj];
  const a = _atMaybeArray(arr);
  const f = _Array$from;
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
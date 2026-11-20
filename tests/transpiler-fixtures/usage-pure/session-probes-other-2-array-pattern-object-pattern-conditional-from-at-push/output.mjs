import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// The first element selects Array, so its extracted from and the later Array.from read must agree.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  // Bind from before extracting at from the second element.
  const [{},,] = [pick ? Array : userObj, arr];
  const f = _Array$from;
  const a = _atMaybeArray(arr);
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 1:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  const [,,] = [arr, pick ? Array : userObj];
  const {} = arr;
  const a = _atMaybeArray(arr);
  const f = _Array$from;
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
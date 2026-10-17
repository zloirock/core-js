import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// probe corpus of the defense cycles over the destructure wrappers, family "other", part 2:
// every block is one probed form, self-contained over the header bindings, locked on both legs
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  // The native first slot reads before the second slot's instance extraction.
  const [{
    from: f
  }] = [pick ? {
    from: _Array$from
  } : userObj, arr];
  const a = _atMaybeArray(arr);
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
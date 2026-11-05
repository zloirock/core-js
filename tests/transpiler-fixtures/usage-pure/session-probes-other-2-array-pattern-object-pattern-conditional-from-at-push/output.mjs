import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An instance capture in the second element preserves the first element's native conditional from read.
// The separate Array.from comparison remains polyfilled.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  // The native first slot reads before the second slot's instance extraction.
  const [{
    from: f
  }] = [pick ? Array : userObj, arr];
  const a = _atMaybeArray(arr);
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
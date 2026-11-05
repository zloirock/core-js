import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// An object slot containing a conditional array retains its native from read.
// The separate Array.from comparison and push call are still polyfilled.
let pick = 1;
const userObj = {};
const log = [];
{
  const {
    w: [{
      from: f
    }]
  } = {
    w: [pick ? Array : userObj]
  };
  _pushMaybeArray(log).call(log, f === _Array$from);
}
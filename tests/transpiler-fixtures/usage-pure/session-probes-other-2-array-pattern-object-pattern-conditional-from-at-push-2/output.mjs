import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A static-only conditional element keeps both native from and at reads.
// The separate Array.from comparison and push call are still served.
let pick = 1;
const userObj = {};
const log = [];
{
  const [{
    from: f,
    at: a
  }] = [pick ? Array : userObj];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}
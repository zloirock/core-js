import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
import _globalThis from "@core-js/pure/actual/global-this";
// A conditional constructor and a realm neighbour retain their native array-pattern reads.
// The later static comparison, push call and realm reference are independently served.
let pick = 1;
const userObj = {};
const log = [];
{
  const [{
    from: f
  }, {
    Map: M
  }] = [pick ? Array : userObj, _globalThis];
  _pushMaybeArray(log).call(log, f === _Array$from, typeof M);
}
import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A class static block keeps its native conditional array-pattern read.
// The later Array.from comparison and push call retain their independent polyfills.
let pick = 1;
const userObj = {};
const log = [];
{
  class C5 {
    static {
      const [{
        from: f
      }] = [pick ? Array : userObj];
      C5.f = f;
    }
  }
  (_pushMaybeArray(log) || 0).call(log, C5.f === _Array$from);
}
import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// A constructor's array default keeps its native supplied/defaulted from reads.
// The later Array.from comparison and push call are independently served.
let pick = 1;
const userObj = {};
const log = [];
{
  class C1 {
    constructor([{
      from: f
    }] = [pick ? Array : userObj]) {
      this.f = f;
    }
  }
  (_pushMaybeArray(log) || 0).call(log, new C1().f === _Array$from, new C1([userObj]).f());
}
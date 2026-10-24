import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Shared capture and receiver-default routes preserve independently supported claims.
// Supplied values and defaults keep their source branches and independent claims. Instance claims retain their own receivers.
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
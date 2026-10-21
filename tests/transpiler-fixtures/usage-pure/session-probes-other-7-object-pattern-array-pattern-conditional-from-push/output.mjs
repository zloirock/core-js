import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
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
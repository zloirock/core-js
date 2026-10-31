import _Array$from from "@core-js/pure/actual/array/from";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Shared capture and receiver-default routes preserve independently supported claims.
// Receiver evaluation, residual reads and independent claims remain live. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const log = [];
{
  const {
    w: {
      from: f
    }
  } = {
    w: pick ? Array : userObj
  };
  _pushMaybeArray(log).call(log, f === _Array$from);
}
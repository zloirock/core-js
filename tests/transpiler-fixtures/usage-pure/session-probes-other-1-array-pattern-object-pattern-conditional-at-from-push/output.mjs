import _Array$from from "@core-js/pure/actual/array/from";
import _atMaybeArray from "@core-js/pure/actual/array/instance/at";
import _pushMaybeArray from "@core-js/pure/actual/array/instance/push";
// Shared capture and receiver-default routes preserve independently supported claims.
// Native iteration, source effects and residual bindings stay in order. Instance claims retain their own receivers.
let pick = 1;
const userObj = {};
const arr = [1, 2];
const log = [];
{
  const [, _ref] = [arr, pick ? Array : userObj];
  const a = _atMaybeArray(arr);
  const f = _Array$from;
  _pushMaybeArray(log).call(log, f === _Array$from, typeof a);
}